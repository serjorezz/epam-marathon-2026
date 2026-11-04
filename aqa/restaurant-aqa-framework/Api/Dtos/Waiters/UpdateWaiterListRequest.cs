namespace Restaurant_Aqa_Framework.Api.Dtos.Waiters;

/// <summary>POST/DELETE /waiters body — links (or unlinks) an already-registered user as the waiter
/// of a location. A location with no waiter in the list cannot accept bookings ("No waiters found
/// for location ID ...").</summary>
public sealed record UpdateWaiterListRequest(string Email, string LocationId);
