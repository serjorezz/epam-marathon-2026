using Microsoft.Playwright;
using Restaurant_Aqa_Framework.Api.Dtos.Waiters;

namespace Restaurant_Aqa_Framework.Api;

public sealed class WaitersApi(IAPIRequestContext api) : ApiClientBase(api)
{
    public Task<IAPIResponse> AddToWaitersListAsync(UpdateWaiterListRequest request, string? bearerToken = null) =>
        Api.PostAsync(Url("/waiters"), new APIRequestContextOptions
        {
            DataString = Serialize(request),
            Headers = Headers(bearerToken),
        });

    public Task<IAPIResponse> RemoveFromWaitersListAsync(UpdateWaiterListRequest request, string? bearerToken = null) =>
        DeleteAsync(Url("/waiters"), new APIRequestContextOptions
        {
            DataString = Serialize(request),
            Headers = Headers(bearerToken),
        });

    public Task<IAPIResponse> GetWaiterLocationAsync(string userId, string? bearerToken = null) =>
        GetAsync(Url($"/waiters/{userId}/location"), new APIRequestContextOptions { Headers = Headers(bearerToken) });
}
