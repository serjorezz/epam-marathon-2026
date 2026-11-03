using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace APIHandler.Models.Chat;

public class ChatMessageDto
{
    [JsonPropertyName("role")]
    public string Role { get; set; } = "user"; // "user" or "model" / "assistant"

    [JsonPropertyName("text")]
    public string Text { get; set; } = string.Empty;
}

public class ChatRequest
{
    [JsonPropertyName("message")]
    public string Message { get; set; } = string.Empty;

    [JsonPropertyName("history")]
    public List<ChatMessageDto>? History { get; set; }
}
