using Restaurant_Aqa_Framework.Api;
using Restaurant_Aqa_Framework.Api.Dtos.Reservations;

namespace Restaurant_Aqa_Framework.Screenplay.Tasks;

/// <summary>
/// Cancels an existing reservation.
/// </summary>
public sealed class CancelReservation(
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

        var api = new ReservationsApi(actor.UsingTheApi());
        var lastResponse = actor.TheLastResponse();

        var response = await api.CancelReservationAsync(resolvedReservationId, bearerToken: token);
        await lastResponse.CaptureAsync(response);
    }
}
