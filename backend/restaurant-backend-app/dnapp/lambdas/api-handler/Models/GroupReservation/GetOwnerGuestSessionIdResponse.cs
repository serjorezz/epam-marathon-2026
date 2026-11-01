using System.Text.Json.Serialization;

namespace APIHandler.Models.GroupReservation;

public record GetOwnerGuestSessionIdResponse(
    [property: JsonPropertyName("guestSessionId")] string GuestSessionId);
