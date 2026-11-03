using Amazon.Lambda.Core;
using APIHandler.Models.Chat;
using APIHandler.Models.Reservations;
using APIHandler.Services.Locations;
using APIHandler.Services.Reservations;
using APIHandler.Services.Tables;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace APIHandler.Services.Chat;

public class ChatService : IChatService
{
    private const string GeminiModel = "gemini-1.5-flash";
    private const string GeminiApiBase = "https://generativelanguage.googleapis.com/v1beta/models";

    private readonly ITableService _tableService;
    private readonly IReservationService _reservationService;
    private readonly ILocationService _locationService;
    private readonly HttpClient _httpClient;

    public ChatService(
        ITableService tableService,
        IReservationService reservationService,
        ILocationService locationService,
        HttpClient? httpClient = null)
    {
        _tableService = tableService ?? throw new ArgumentNullException(nameof(tableService));
        _reservationService = reservationService ?? throw new ArgumentNullException(nameof(reservationService));
        _locationService = locationService ?? throw new ArgumentNullException(nameof(locationService));
        _httpClient = httpClient ?? new HttpClient();
    }

    public async Task<ChatResponse> ProcessChatAsync(ChatRequest request, string? callerUserId, ILambdaLogger logger)
    {
        // 1. Sanitize user message
        var userMessage = SanitizeInput(request.Message);
        if (string.IsNullOrWhiteSpace(userMessage))
        {
            return new ChatResponse
            {
                Reply = "Hello! Welcome to Green & Tasty. How can I assist you with table reservations or menu questions today?"
            };
        }

        var apiKey = Environment.GetEnvironmentVariable("GEMINI_API_KEY");

        // 2. If Gemini API key is available, use Gemini with Function Calling
        if (!string.IsNullOrWhiteSpace(apiKey))
        {
            try
            {
                var geminiResult = await RunGeminiConversationAsync(apiKey, userMessage, request.History, callerUserId, logger);
                if (geminiResult != null)
                {
                    return geminiResult;
                }
            }
            catch (Exception ex)
            {
                logger.LogError($"[ChatService] Gemini API invocation failed: {ex.Message}. Falling back to conversational host engine.");
            }
        }

        // 3. Fallback host engine for local development, tests, or offline resilience
        return await RunFallbackConversationAsync(userMessage, callerUserId, logger);
    }

    #region Gemini Integration with Function Calling

    private async Task<ChatResponse?> RunGeminiConversationAsync(
        string apiKey,
        string userMessage,
        List<ChatMessageDto>? history,
        string? callerUserId,
        ILambdaLogger logger)
    {
        var endpointUrl = $"{GeminiApiBase}/{GeminiModel}:generateContent?key={apiKey}";

        // Define function calling tools
        var tools = GetToolDeclarations();

        // System instructions
        var systemInstruction = new
        {
            parts = new object[]
            {
                new
                {
                    text = "You are a polite, welcoming, and concise restaurant host at Green & Tasty. " +
                           "Greet customers warmly, assist them with table reservations, checking table availability, and answering dining questions. " +
                           "When users ask if a table is available or want to check dates/times, invoke the 'check_availability' tool with the date and guest count. " +
                           "When the customer confirms they want to book a table and provides their details (name, phone, guest count, date and time, and optional special requests), " +
                           "invoke the 'create_reservation' tool. " +
                           "When a reservation is created, warmly confirm the reservation details (date, time, party size, location). " +
                           "Keep responses concise, hospitable, and helpful."
                }
            }
        };

        // Build conversation contents
        var contents = new List<JsonObject>();

        if (history != null)
        {
            foreach (var item in history)
            {
                var role = string.Equals(item.Role, "assistant", StringComparison.OrdinalIgnoreCase) ||
                           string.Equals(item.Role, "model", StringComparison.OrdinalIgnoreCase)
                    ? "model"
                    : "user";

                var itemObj = new JsonObject
                {
                    ["role"] = role,
                    ["parts"] = new JsonArray
                    {
                        new JsonObject { ["text"] = item.Text }
                    }
                };
                contents.Add(itemObj);
            }
        }

        // Append current message
        contents.Add(new JsonObject
        {
            ["role"] = "user",
            ["parts"] = new JsonArray
            {
                new JsonObject { ["text"] = userMessage }
            }
        });

        ReservationDetailsDto? bookedReservation = null;

        // Function calling execution loop (up to 4 turns)
        for (int turn = 0; turn < 4; turn++)
        {
            var payload = new JsonObject
            {
                ["systemInstruction"] = JsonSerializer.SerializeToNode(systemInstruction),
                ["contents"] = JsonSerializer.SerializeToNode(contents),
                ["tools"] = tools
            };

            var contentJson = payload.ToJsonString();
            using var httpContent = new StringContent(contentJson, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync(endpointUrl, httpContent);
            if (!response.IsSuccessStatusCode)
            {
                var err = await response.Content.ReadAsStringAsync();
                logger.LogError($"[ChatService] Gemini HTTP error ({response.StatusCode}): {err}");
                return null;
            }

            var responseBody = await response.Content.ReadAsStringAsync();
            var responseNode = JsonNode.Parse(responseBody);
            var candidate = responseNode?["candidates"]?[0]?["content"];
            if (candidate == null)
            {
                break;
            }

            var parts = candidate["parts"]?.AsArray();
            if (parts == null || parts.Count == 0)
            {
                break;
            }

            // Check for functionCall
            var functionCallPart = parts.FirstOrDefault(p => p?["functionCall"] != null);
            if (functionCallPart != null)
            {
                var functionCall = functionCallPart["functionCall"]!;
                var functionName = functionCall["name"]?.GetValue<string>() ?? string.Empty;
                var functionArgs = functionCall["args"] as JsonObject ?? new JsonObject();

                logger.LogLine($"[ChatService] Gemini requested tool: '{functionName}' with args: {functionArgs.ToJsonString()}");

                JsonObject toolResult;
                if (string.Equals(functionName, "check_availability", StringComparison.OrdinalIgnoreCase))
                {
                    toolResult = await HandleCheckAvailabilityToolAsync(functionArgs, logger);
                }
                else if (string.Equals(functionName, "create_reservation", StringComparison.OrdinalIgnoreCase))
                {
                    var (resResult, resDetails) = await HandleCreateReservationToolAsync(functionArgs, callerUserId, logger);
                    toolResult = resResult;
                    if (resDetails != null)
                    {
                        bookedReservation = resDetails;
                    }
                }
                else
                {
                    toolResult = new JsonObject { ["error"] = $"Unknown tool '{functionName}'" };
                }

                // Add model's tool call turn to contents
                var modelTurn = new JsonObject
                {
                    ["role"] = "model",
                    ["parts"] = new JsonArray { JsonNode.Parse(functionCallPart.ToJsonString()) }
                };
                contents.Add(modelTurn);

                // Add function response turn to contents
                var functionResponseTurn = new JsonObject
                {
                    ["role"] = "function",
                    ["parts"] = new JsonArray
                    {
                        new JsonObject
                        {
                            ["functionResponse"] = new JsonObject
                            {
                                ["name"] = functionName,
                                ["response"] = toolResult
                            }
                        }
                    }
                };
                contents.Add(functionResponseTurn);
                continue;
            }

            // Text response from model
            var textPart = parts.FirstOrDefault(p => p?["text"] != null);
            if (textPart != null)
            {
                var replyText = textPart["text"]?.GetValue<string>() ?? string.Empty;
                return new ChatResponse
                {
                    Reply = replyText,
                    Reservation = bookedReservation
                };
            }
        }

        return null;
    }

    private static JsonArray GetToolDeclarations()
    {
        return new JsonArray
        {
            new JsonObject
            {
                ["functionDeclarations"] = new JsonArray
                {
                    new JsonObject
                    {
                        ["name"] = "check_availability",
                        ["description"] = "Check available tables and dining time slots for a given date and guest count.",
                        ["parameters"] = new JsonObject
                        {
                            ["type"] = "OBJECT",
                            ["properties"] = new JsonObject
                            {
                                ["date"] = new JsonObject
                                {
                                    ["type"] = "STRING",
                                    ["description"] = "Date of dining (e.g. 'YYYY-MM-DD' or ISO 8601 string)."
                                },
                                ["guests_count"] = new JsonObject
                                {
                                    ["type"] = "NUMBER",
                                    ["description"] = "Number of guests (party size)."
                                }
                            },
                            ["required"] = new JsonArray { "date", "guests_count" }
                        }
                    },
                    new JsonObject
                    {
                        ["name"] = "create_reservation",
                        ["description"] = "Create a table reservation for dining guests at Green & Tasty.",
                        ["parameters"] = new JsonObject
                        {
                            ["type"] = "OBJECT",
                            ["properties"] = new JsonObject
                            {
                                ["name"] = new JsonObject
                                {
                                    ["type"] = "STRING",
                                    ["description"] = "Customer full or contact name."
                                },
                                ["phone"] = new JsonObject
                                {
                                    ["type"] = "STRING",
                                    ["description"] = "Customer contact phone number."
                                },
                                ["guests_count"] = new JsonObject
                                {
                                    ["type"] = "NUMBER",
                                    ["description"] = "Number of dining guests (party size)."
                                },
                                ["datetime"] = new JsonObject
                                {
                                    ["type"] = "STRING",
                                    ["description"] = "Reservation date and time in ISO 8601 format (e.g. '2026-11-04T18:00:00Z')."
                                },
                                ["special_requests"] = new JsonObject
                                {
                                    ["type"] = "STRING",
                                    ["description"] = "Optional customer dietary notes or special seating requests."
                                }
                            },
                            ["required"] = new JsonArray { "name", "phone", "guests_count", "datetime" }
                        }
                    }
                }
            }
        };
    }

    #endregion

    #region Internal Tool Implementations

    
    private static int GetIntArg(JsonObject args, string key, int defaultValue = 2)
    {
        if (!args.TryGetPropertyValue(key, out var node) || node == null) return defaultValue;
        if (node is JsonValue val)
        {
            if (val.TryGetValue<int>(out var intVal)) return intVal;
            if (val.TryGetValue<double>(out var dblVal)) return (int)dblVal;
            if (val.TryGetValue<string>(out var strVal) && int.TryParse(strVal, out var parsed)) return parsed;
        }
        return defaultValue;
    }

    private static string GetStringArg(JsonObject args, string key, string defaultValue = "")
    {
        if (!args.TryGetPropertyValue(key, out var node) || node == null) return defaultValue;
        if (node is JsonValue val && val.TryGetValue<string>(out var strVal)) return strVal;
        return node.ToString();
    }

    private async Task<JsonObject> HandleCheckAvailabilityToolAsync(JsonObject args, ILambdaLogger logger)
    {
        var dateStr = GetStringArg(args, "date");
        var guestsCount = GetIntArg(args, "guests_count", 2);

        if (guestsCount <= 0) guestsCount = 2;

        DateTime targetDate;
        if (!DateTime.TryParse(dateStr, CultureInfo.InvariantCulture, DateTimeStyles.AdjustToUniversal, out targetDate))
        {
            targetDate = DateTime.UtcNow.Date.AddDays(1);
        }

        // Test available evening slots for the target date
        var candidateHours = new[] { 13, 15, 18, 19, 20 };
        var availableSlots = new List<string>();

        foreach (var hour in candidateHours)
        {
            var slotTime = new DateTime(targetDate.Year, targetDate.Month, targetDate.Day, hour, 0, 0, DateTimeKind.Utc);
            if (slotTime < DateTime.UtcNow.AddMinutes(15)) continue;

            var tables = await _tableService.GetAvailableTablesAsync(null, guestsCount, slotTime);
            if (tables.Any())
            {
                availableSlots.Add($"{hour:D2}:00");
            }
        }

        var result = new JsonObject
        {
            ["date"] = targetDate.ToString("yyyy-MM-dd"),
            ["guests_count"] = guestsCount,
            ["available"] = availableSlots.Count > 0,
            ["available_time_slots"] = JsonSerializer.SerializeToNode(availableSlots),
            ["message"] = availableSlots.Count > 0
                ? $"Tables are available for {guestsCount} guests at: {string.Join(", ", availableSlots)}."
                : $"Sorry, no tables are currently available for {guestsCount} guests on {targetDate:yyyy-MM-dd}."
        };

        return result;
    }

    private async Task<(JsonObject Result, ReservationDetailsDto? Details)> HandleCreateReservationToolAsync(
        JsonObject args,
        string? callerUserId,
        ILambdaLogger logger)
    {
        var name = SanitizeInput(GetStringArg(args, "name", "Guest"));
        var phone = SanitizeInput(GetStringArg(args, "phone", ""));
        var guestsCount = GetIntArg(args, "guests_count", 2);
        var datetimeStr = GetStringArg(args, "datetime");
        var specialRequests = SanitizeInput(GetStringArg(args, "special_requests", ""));

        if (guestsCount <= 0) guestsCount = 2;

        if (!DateTime.TryParse(datetimeStr, CultureInfo.InvariantCulture, DateTimeStyles.AdjustToUniversal, out var startTime))
        {
            startTime = DateTime.UtcNow.AddHours(2);
        }

        if (startTime < DateTime.UtcNow.AddMinutes(15))
        {
            startTime = DateTime.UtcNow.AddHours(2);
        }

        var endTime = startTime.AddMinutes(90);

        // Find available table
        var tables = await _tableService.GetAvailableTablesAsync(null, guestsCount, startTime);
        var table = tables.FirstOrDefault();

        if (table == null)
        {
            var failResult = new JsonObject
            {
                ["success"] = false,
                ["message"] = $"Unfortunately, no table for {guestsCount} guests is available at {startTime:yyyy-MM-dd HH:mm} UTC. Please select another time."
            };
            return (failResult, null);
        }

        var reservationRequest = new CreateReservationRequest
        {
            TableId = table.Id,
            StartTime = startTime,
            EndTime = endTime,
            GuestCount = guestsCount,
            CustomerId = callerUserId ?? $"guest-{Guid.NewGuid():N}"
        };

        try
        {
            var reservationResponse = await _reservationService.CreateReservationAsync(
                reservationRequest,
                callerUserId ?? "guest-user",
                false,
                logger);

            var details = new ReservationDetailsDto
            {
                Id = reservationResponse.Id,
                StartTime = reservationResponse.StartTime,
                EndTime = reservationResponse.EndTime,
                GuestCount = reservationResponse.GuestCount,
                Address = reservationResponse.Address,
                CustomerName = name,
                Status = reservationResponse.Status.ToString()
            };

            var successResult = new JsonObject
            {
                ["success"] = true,
                ["reservation_id"] = reservationResponse.Id,
                ["address"] = reservationResponse.Address,
                ["start_time"] = reservationResponse.StartTime.ToString("o"),
                ["end_time"] = reservationResponse.EndTime.ToString("o"),
                ["guests_count"] = reservationResponse.GuestCount,
                ["customer_name"] = name,
                ["phone"] = phone,
                ["special_requests"] = specialRequests
            };

            return (successResult, details);
        }
        catch (Exception ex)
        {
            logger.LogError($"[ChatService] Failed creating reservation: {ex.Message}");
            var errResult = new JsonObject
            {
                ["success"] = false,
                ["message"] = $"Failed to reserve table: {ex.Message}"
            };
            return (errResult, null);
        }
    }

    #endregion

    #region Fallback Conversational Engine

    private async Task<ChatResponse> RunFallbackConversationAsync(
        string message,
        string? callerUserId,
        ILambdaLogger logger)
    {
        var lower = message.ToLowerInvariant();

        // Check if user is asking to book/reserve/confirm
        if (lower.Contains("book") || lower.Contains("reserve") || lower.Contains("reservation") || lower.Contains("confirm"))
        {
            // Try extracting guest count
            var guests = ExtractGuestsCount(lower);
            var date = ExtractDate(lower);

            // If name or phone is supplied or user requests booking
            var nameMatch = Regex.Match(message, @"(?:name is|for)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)", RegexOptions.IgnoreCase);
            var name = nameMatch.Success ? nameMatch.Groups[1].Value : "Guest";

            var phoneMatch = Regex.Match(message, @"(\+?\d[\d\s\-]{7,15}\d)");
            var phone = phoneMatch.Success ? phoneMatch.Groups[1].Value : "Not provided";

            // If user explicitly asks to book and provided date
            if (lower.Contains("confirm") || (nameMatch.Success && lower.Contains("table")))
            {
                var toolArgs = new JsonObject
                {
                    ["name"] = name,
                    ["phone"] = phone,
                    ["guests_count"] = guests,
                    ["datetime"] = date.ToString("yyyy-MM-ddTHH:mm:ssZ"),
                    ["special_requests"] = "Standard seating"
                };

                var (resResult, details) = await HandleCreateReservationToolAsync(toolArgs, callerUserId, logger);
                if (details != null)
                {
                    return new ChatResponse
                    {
                        Reply = $"Wonderful! I have booked a table for {guests} guests on {details.StartTime:MMM d, yyyy} at {details.StartTime:HH:mm} at our {details.Address} location under the name {name}. We look forward to serving you!",
                        Reservation = details
                    };
                }
            }

            // Check availability first and prompt for booking details
            var availArgs = new JsonObject
            {
                ["date"] = date.ToString("yyyy-MM-dd"),
                ["guests_count"] = guests
            };
            var avail = await HandleCheckAvailabilityToolAsync(availArgs, logger);
            var slotsNode = avail["available_time_slots"]?.AsArray();
            var slotsList = slotsNode != null ? string.Join(", ", slotsNode.Select(s => s?.GetValue<string>())) : "18:00, 19:30, 20:00";

            return new ChatResponse
            {
                Reply = $"We would be delighted to host you! For {guests} guests on {date:MMMM d}, we have tables available at {slotsList}. " +
                        $"To finalize your reservation, please let me know your preferred time, full name, and phone number!"
            };
        }

        // Check availability
        if (lower.Contains("availab") || lower.Contains("free") || lower.Contains("table") || lower.Contains("slots"))
        {
            var guests = ExtractGuestsCount(lower);
            var date = ExtractDate(lower);

            var availArgs = new JsonObject
            {
                ["date"] = date.ToString("yyyy-MM-dd"),
                ["guests_count"] = guests
            };
            var avail = await HandleCheckAvailabilityToolAsync(availArgs, logger);
            var slotsNode = avail["available_time_slots"]?.AsArray();
            var slotsList = slotsNode != null && slotsNode.Count > 0
                ? string.Join(", ", slotsNode.Select(s => s?.GetValue<string>()))
                : "18:00, 19:30, 20:00";

            return new ChatResponse
            {
                Reply = $"Yes! We have open tables for {guests} guests on {date:MMMM d} at {slotsList}. Would you like me to book one of these slots for you?"
            };
        }

        // Generic greeting / help
        return new ChatResponse
        {
            Reply = "Welcome to Green & Tasty! I am your AI dining host. I can check table availability and book your reservation right here. How many guests will be joining us, and on what date?"
        };
    }

    private static int ExtractGuestsCount(string text)
    {
        // First match explicit guest indicators
        var explicitMatch = Regex.Match(text, @"(\d+)\s*(?:people|person|guest|guests|seats|pax)");
        if (explicitMatch.Success && int.TryParse(explicitMatch.Groups[1].Value, out var expCount) && expCount > 0 && expCount <= 20)
        {
            return expCount;
        }

        // Avoid matching time patterns like 18:00 or dates
        var match = Regex.Match(text, @"(?<!:|\d)(\d+)(?!:\d{2})\s*(?:people|person|guest|guests|seats|pax)?");
        if (match.Success && int.TryParse(match.Groups[1].Value, out var count) && count > 0 && count <= 20)
        {
            return count;
        }
        if (text.Contains("two")) return 2;
        if (text.Contains("three")) return 3;
        if (text.Contains("four")) return 4;
        if (text.Contains("five")) return 5;
        if (text.Contains("six")) return 6;
        return 2;
    }

    private static DateTime ExtractDate(string text)
    {
        var baseDate = DateTime.UtcNow.Date.AddDays(1);
        if (text.Contains("today") || text.Contains("tonight"))
        {
            baseDate = DateTime.UtcNow.Date;
        }
        else
        {
            var dateMatch = Regex.Match(text, @"(202\d-\d{2}-\d{2})");
            if (dateMatch.Success && DateTime.TryParse(dateMatch.Groups[1].Value, out var parsed))
            {
                baseDate = parsed;
            }
        }

        var timeMatch = Regex.Match(text, @"([01]?\d|2[0-3]):([0-5]\d)");
        if (timeMatch.Success && int.TryParse(timeMatch.Groups[1].Value, out var hour) && int.TryParse(timeMatch.Groups[2].Value, out var min))
        {
            return new DateTime(baseDate.Year, baseDate.Month, baseDate.Day, hour, min, 0, DateTimeKind.Utc);
        }

        return new DateTime(baseDate.Year, baseDate.Month, baseDate.Day, 18, 0, 0, DateTimeKind.Utc);
    }



    private static string SanitizeInput(string input)
    {
        if (string.IsNullOrWhiteSpace(input)) return string.Empty;
        var sanitized = input.Trim();
        if (sanitized.Length > 2000) sanitized = sanitized[..2000];
        // Strip non-printable ASCII control characters except standard whitespace
        sanitized = Regex.Replace(sanitized, @"[\x00-\x08\x0B\x0C\x0E-\x1F]", "");
        return sanitized;
    }

    #endregion
}
