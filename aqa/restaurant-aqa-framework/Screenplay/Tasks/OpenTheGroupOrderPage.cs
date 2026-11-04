using Restaurant_Aqa_Framework.Api.Dtos.Reservations;
using Restaurant_Aqa_Framework.Ui;

namespace Restaurant_Aqa_Framework.Screenplay.Tasks;

/// <summary>The signed-in owner opens the consolidated group pre-order page of the remembered
/// reservation (direct URL — the reservation cards do not link to it).</summary>
public sealed class OpenTheGroupOrderPage : ITask
{
    public async Task PerformAsAsync(Actor actor)
    {
        var reservation = actor.Recall<ReservationResponse>(SetUpAGroupReservation.ReservationKey);
        await new GroupOrderPage(actor.LookingAtThePage()).NavigateForAsync(reservation.Id);
    }
}
