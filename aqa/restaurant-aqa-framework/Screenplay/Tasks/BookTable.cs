using Restaurant_Aqa_Framework.Api;
using Restaurant_Aqa_Framework.Api.Dtos.Reservations;
using Restaurant_Aqa_Framework.Api.Dtos.Tables;
using Restaurant_Aqa_Framework.Api.Seeding;

namespace Restaurant_Aqa_Framework.Screenplay.Tasks;

/// <summary>
/// Books a table for a customer with given parameters.
/// Remembers the created reservation and registers cleanup with <see cref="CleanupScope"/>.
/// </summary>
public sealed class BookTable(
    DateTime startTime,
    DateTime endTime,
    int guestCount,
    string? tableId = null,
    string? customerToken = null,
    bool isAnonymous = false) : ITask
{
    public const string LastReservationMemory = "lastReservation";

    public async Task PerformAsAsync(Actor actor)
    {
        var resolvedTableId = tableId ?? actor.Recall<TableResponse>().Id;
        string? token = null;

        if (!isAnonymous)
        {
            token = customerToken
                ?? (actor.TryRecall<CustomerSession>(out var session) ? session.Token : null);
        }

        var request = new CreateReservationRequest(resolvedTableId, startTime, endTime, guestCount);
        var api = new ReservationsApi(actor.UsingTheApi());
        var lastResponse = actor.TheLastResponse();

        var response = await api.CreateReservationAsync(request, bearerToken: token);
        await lastResponse.CaptureAsync(response);

        if (response.Status < 400)
        {
            var reservation = await response.ReadAsAsync<ReservationResponse>();
            actor.Remember(reservation);
            actor.Remember(LastReservationMemory, reservation);

            actor.Recall<CleanupScope>().TrackDelete(
                $"reservation:{reservation.Id}",
                async () => await api.CancelReservationAsync(reservation.Id, bearerToken: token));
        }
    }
}
