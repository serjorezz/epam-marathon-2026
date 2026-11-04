using Restaurant_Aqa_Framework.Api.Dtos.Dishes;

namespace Restaurant_Aqa_Framework.Api.Dtos.GuestSessions;

public sealed record CreateGuestSessionRequest(string GroupReservationId, string GuestName);

/// <summary>POST /guest/sessions answers 200 (not 201) with PascalCase keys — see
/// <see cref="JsonDefaults"/> case-insensitive reading. The SessionId (a GUID) is the path
/// parameter for every later guest call; the SessionToken is its bearer credential.</summary>
public sealed record CreateGuestSessionResponse(string SessionId, string SessionToken);

/// <summary>GET /guest/sessions/{id} — the guest's own view of their cart.</summary>
public sealed record GuestSessionViewResponse(
    string Name,
    IReadOnlyList<GuestSessionItemDto> Items,
    decimal Total,
    bool IsSubmitted);

public sealed record GuestSessionItemDto(GuestSessionDishDto Dish, int Quantity);

public sealed record GuestSessionDishDto(string Id, string Name, decimal Price);

/// <summary>GET /guest/sessions/{id}/menu answers 200 with the menu grouped by category:
/// {"dishes": {"Dessert": [...], "MainCourse": [...]}}.</summary>
public sealed record GuestMenuResponse(Dictionary<string, DishListResponse[]> Dishes);

public sealed record AddGuestSessionDishRequest(string DishId, int Quantity);

/// <summary>The backend validates Quantity > 0 even for removals and decrements the line by it,
/// dropping it at zero — verified live (a {dishId}-only body answers 400).</summary>
public sealed record RemoveGuestSessionDishRequest(string DishId, int Quantity);
