using Restaurant_Aqa_Framework.Api;
using Restaurant_Aqa_Framework.Api.Dtos.Orders;
using Restaurant_Aqa_Framework.Screenplay.Tasks;

namespace Restaurant_Aqa_Framework.Screenplay.Questions;

/// <summary>The reservation's pre-order as seen through the given bearer token (owner, waiter, ...)
/// — its composition, line-item states and status.</summary>
public sealed class TheOrderForTheGroup(string bearerToken) : IQuestion<GetOrderResponse>
{
    public async Task<GetOrderResponse> AnsweredByAsync(Actor actor)
    {
        var reservation = actor.Recall<Api.Dtos.Reservations.ReservationResponse>(SetUpAGroupReservation.ReservationKey);
        var response = await new OrdersApi(actor.UsingTheApi()).GetOrderAsync(reservation.Id, bearerToken);
        return await response.ReadAsAsync<GetOrderResponse>();
    }
}
