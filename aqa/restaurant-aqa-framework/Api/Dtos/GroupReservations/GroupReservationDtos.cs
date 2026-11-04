namespace Restaurant_Aqa_Framework.Api.Dtos.GroupReservations;

/// <summary>Response shapes of the group pre-order routes, verified live against the deployment
/// (the README's homework section documents the chosen behaviors). The invite-by-token response uses PascalCase keys while the
/// sessions response is camelCase; <see cref="JsonDefaults"/> reads case-insensitively so plain
/// records cover both.</summary>
public sealed record InviteTokenResponse(string Token);

public sealed record GroupInviteResponse(
    string GroupReservationId,
    string LocationId,
    string RestaurantName,
    string LocationAddress,
    DateTime StartTime,
    DateTime EndTime,
    int MaxGuestCount,
    int TableNumber,
    string InviterName);

public sealed record OwnerGuestSessionIdResponse(string GuestSessionId);

public sealed record GroupSessionsResponse(
    IReadOnlyList<GroupParticipantDto> Participants,
    decimal Total);

public sealed record GroupParticipantDto(
    string Id,
    string Type,
    string Name,
    IReadOnlyList<ParticipantItemDto> Items,
    decimal Total,
    bool IsSubmitted);

public sealed record ParticipantItemDto(ParticipantDishDto Dish, int Quantity);

public sealed record ParticipantDishDto(string Id, string Name, decimal Price);

public sealed record SubmitGroupPreOrderRequest(string ReservationId);

public sealed record SubmittedDishDto(string DishId, int Quantity);

/// <summary>GET /guest/groups/{id}/status — the live shape is currentParticipants/maxCapacity/status,
/// not the totalGuests/submittedGuests the API docs describe.</summary>
public sealed record GroupStatusResponse(int CurrentParticipants, int MaxCapacity, string Status);
