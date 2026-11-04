using Restaurant_Aqa_Framework.Api;
using Restaurant_Aqa_Framework.Api.Dtos.Reservations;

namespace Restaurant_Aqa_Framework.Screenplay.Tasks;

/// <summary>
/// Edits an existing reservation with new time or guest count.
/// </summary>
public sealed class EditReservation(
    DateTime startTime,
    DateTime endTime,
    int guestCount,
    string? reservationId = null,
    string? customerToken = null,
    bool isAnonymous = false) : ITask
{
    public async Task PerformAsAsync(Actor actor)
    {
        var resolvedReservationId = reservationId ?? actor.Recall<ReservationResponse>().Id;
        string? token = null;

        if (!isAnonymous)
        {
            token = customerToken
                ?? (actor.TryRecall<CustomerSession>(out var session) ? session.Token : null);
        }

        var request = new EditReservationRequest(resolvedReservationId, startTime, endTime, guestCount);
        var api = new ReservationsApi(actor.UsingTheApi());
        var lastResponse = actor.TheLastResponse();

        var response = await api.EditReservationAsync(request, bearerToken: token);
        await lastResponse.CaptureAsync(response);

        if (response.Status < 400)
        {
            var updated = await response.ReadAsAsync<ReservationResponse>();
            actor.Remember(updated);
        }
    }
}
