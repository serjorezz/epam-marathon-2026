using System;
using System.Text.Json.Serialization;

namespace APIHandler.Models.Chat;

public class ReservationDetailsDto
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("startTime")]
    public DateTime StartTime { get; set; }

    [JsonPropertyName("endTime")]
    public DateTime EndTime { get; set; }

    [JsonPropertyName("guestCount")]
    public int GuestCount { get; set; }

    [JsonPropertyName("address")]
    public string Address { get; set; } = string.Empty;

    [JsonPropertyName("customerName")]
    public string? CustomerName { get; set; }

    [JsonPropertyName("status")]
    public string Status { get; set; } = "Reserved";
}

public class ChatResponse
{
    [JsonPropertyName("reply")]
    public string Reply { get; set; } = string.Empty;

    [JsonPropertyName("reservation")]
    public ReservationDetailsDto? Reservation { get; set; }
}
