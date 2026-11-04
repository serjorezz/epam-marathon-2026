using Restaurant_Aqa_Framework.Api;
using Restaurant_Aqa_Framework.Api.Dtos.Tables;

namespace Restaurant_Aqa_Framework.Screenplay.Questions;

/// <summary>
/// Queries the restaurant's available tables for a given location, capacity and start time.
/// </summary>
public sealed class TheAvailableTables(string locationId, int capacity, DateTime startTime) : IQuestion<IReadOnlyList<TableResponse>>
{
    public async Task<IReadOnlyList<TableResponse>> AnsweredByAsync(Actor actor)
    {
        var api = new TablesApi(actor.UsingTheApi());
        var response = await api.GetAvailableTablesAsync(locationId, capacity, startTime);

        await actor.TheLastResponse().CaptureAsync(response);

        return response.Status < 400
            ? await response.ReadAsAsync<List<TableResponse>>()
            : [];
    }
}
