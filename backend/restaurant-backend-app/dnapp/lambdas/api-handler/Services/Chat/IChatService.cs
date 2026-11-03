using Amazon.Lambda.Core;
using APIHandler.Models.Chat;
using System.Threading.Tasks;

namespace APIHandler.Services.Chat;

public interface IChatService
{
    Task<ChatResponse> ProcessChatAsync(ChatRequest request, string? callerUserId, ILambdaLogger logger);
}
