using Microsoft.Playwright;
using Restaurant_Aqa_Framework.Api.Dtos.GuestSessions;

namespace Restaurant_Aqa_Framework.Api;

/// <summary>Guest-side session routes. NOTE the path prefix is /guest/sessions (RouteRegistry.cs) —
/// ApiRoutes.md documents /guest-sessions/{id}/... which does not exist on the deployment and
/// answers 403 from API Gateway.</summary>
public sealed class GuestSessionsApi(IAPIRequestContext api) : ApiClientBase(api)
{
    public Task<IAPIResponse> CreateAsync(CreateGuestSessionRequest request) =>
        Api.PostAsync(Url("/guest/sessions"), new APIRequestContextOptions
        {
            DataString = Serialize(request),
            Headers = Headers(),
        });

    public Task<IAPIResponse> GetAsync(string guestSessionId, string sessionToken) =>
        GetAsync(Url($"/guest/sessions/{guestSessionId}"), new APIRequestContextOptions
        {
            Headers = Headers(sessionToken),
        });

    public Task<IAPIResponse> AddDishAsync(string guestSessionId, AddGuestSessionDishRequest request, string sessionToken) =>
        Api.PostAsync(Url($"/guest/sessions/{guestSessionId}/dishes"), new APIRequestContextOptions
        {
            DataString = Serialize(request),
            Headers = Headers(sessionToken),
        });

    public Task<IAPIResponse> RemoveDishAsync(string guestSessionId, RemoveGuestSessionDishRequest request, string sessionToken) =>
        DeleteAsync(Url($"/guest/sessions/{guestSessionId}/dishes"), new APIRequestContextOptions
        {
            DataString = Serialize(request),
            Headers = Headers(sessionToken),
        });

    public Task<IAPIResponse> GetMenuAsync(string guestSessionId, string sessionToken) =>
        GetAsync(Url($"/guest/sessions/{guestSessionId}/menu"), new APIRequestContextOptions
        {
            Headers = Headers(sessionToken),
        });

    public Task<IAPIResponse> SubmitCartAsync(string guestSessionId, string sessionToken) =>
        Api.PostAsync(Url($"/guest/sessions/{guestSessionId}/submit"), new APIRequestContextOptions
        {
            Headers = Headers(sessionToken),
        });
}
