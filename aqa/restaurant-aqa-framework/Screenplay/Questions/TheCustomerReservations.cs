using Restaurant_Aqa_Framework.Api;
using Restaurant_Aqa_Framework.Api.Dtos.Reservations;
using Restaurant_Aqa_Framework.Screenplay.Tasks;

namespace Restaurant_Aqa_Framework.Screenplay.Questions;

/// <summary>
/// Retrieves the list of reservations belonging to the signed-in customer.
/// </summary>
public sealed class TheCustomerReservations(string? customerToken = null) : IQuestion<IReadOnlyList<ReservationResponse>>
{
    public async Task<IReadOnlyList<ReservationResponse>> AnsweredByAsync(Actor actor)
    {
        var token = customerToken
            ?? (actor.TryRecall<CustomerSession>(out var session) ? session.Token : null);

        var api = new ReservationsApi(actor.UsingTheApi());
        var response = await api.GetReservationsAsync(bearerToken: token);

        await actor.TheLastResponse().CaptureAsync(response);

        return response.Status < 400
            ? await response.ReadAsAsync<List<ReservationResponse>>()
            : [];
    }
}
