using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using APIHandler.Helpers;
using APIHandler.Models.Chat;
using APIHandler.Services.Chat;
using System;
using System.Text.Json;
using System.Threading.Tasks;

namespace APIHandler.Handlers.Chat;

public class ChatHandler : IApiRequestHandler
{
    private readonly IChatService _chatService;

    public ChatHandler(IChatService chatService)
    {
        _chatService = chatService ?? throw new ArgumentNullException(nameof(chatService));
    }

    public async Task<APIGatewayProxyResponse> HandleRequest(APIGatewayProxyRequest request, ILambdaContext context)
    {
        if (string.Equals(request.HttpMethod, "OPTIONS", StringComparison.OrdinalIgnoreCase))
        {
            return ResponseBuilder.CreateOptionsResponse();
        }

        if (string.IsNullOrWhiteSpace(request.Body))
        {
            return ResponseBuilder.CreateErrorResponse(400, "Request body cannot be empty.", context.Logger);
        }

        ChatRequest? chatRequest;
        try
        {
            chatRequest = JsonSerializer.Deserialize<ChatRequest>(request.Body, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });
        }
        catch (JsonException ex)
        {
            return ResponseBuilder.CreateErrorResponse(400, $"Invalid JSON format: {ex.Message}", context.Logger);
        }

        if (chatRequest is null || string.IsNullOrWhiteSpace(chatRequest.Message))
        {
            return ResponseBuilder.CreateErrorResponse(400, "The 'message' field is required.", context.Logger);
        }

        var callerUserId = UserContextHelper.GetAuthenticatedUserId(request);

        try
        {
            var chatResponse = await _chatService.ProcessChatAsync(chatRequest, callerUserId, context.Logger);
            return ResponseBuilder.CreateJsonResponse(200, chatResponse);
        }
        catch (Exception ex)
        {
            context.Logger.LogError($"[ChatHandler] Unhandled exception: {ex}");
            return ResponseBuilder.CreateJsonResponse(200, new ChatResponse
            {
                Reply = "I apologize, but I encountered an unexpected error processing your request. Please try again or feel free to book directly through our reservation page."
            });
        }
    }
}
