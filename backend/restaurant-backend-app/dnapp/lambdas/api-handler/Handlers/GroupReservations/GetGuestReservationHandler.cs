using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using APIHandler.Exceptions;
using APIHandler.Helpers;
using APIHandler.Services.GroupReservations;
using System;
using System.Threading.Tasks;

namespace APIHandler.Handlers.GuestReservations;

public class GetGroupReservationHandler(IGroupReservationService groupReservationService) : IApiRequestHandler
{
    public async Task<APIGatewayProxyResponse> HandleRequest(APIGatewayProxyRequest request, ILambdaContext context)
    {
        if (!request.TryGetPathValue("token", out string? token))
            return ResponseBuilder.CreateErrorResponse(400, "Token is requried.", context.Logger);

        try
        {
            // Guests call this without auth; the owner review flow sends the user JWT.
            // The route itself is unauthenticated (guests must stay anonymous), so when
            // there are no authorizer claims we validate the optional Bearer token here.
            // When the caller is the owner, guest-only restrictions are skipped server-side.
            string? userId = null;

            if (request.RequestContext?.Authorizer?.Claims != null &&
                request.RequestContext.Authorizer.Claims.TryGetValue("sub", out var sub))
            {
                userId = sub;
            }
            else if (request.Headers != null &&
                     request.Headers.TryGetValue("Authorization", out var authHeader) &&
                     authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            {
                try
                {
                    var identity = await CognitoIdTokenValidator.ValidateAsync(authHeader["Bearer ".Length..].Trim());
                    userId = identity?.FindFirst("sub")?.Value;
                }
                catch
                {
                    // Invalid/expired token — treat as an anonymous guest.
                    userId = null;
                }
            }

            var result = await groupReservationService.GetGroupReservationByTokenAsync(token, userId);
            return ResponseBuilder.CreateSuccessResponse(result);
        }
        catch(GroupReservationNotFoundException exception)
        {
            return ResponseBuilder.CreateErrorResponse(404, exception.Message, context.Logger, exception);
        }
        catch (GroupReservationExpiredException exception)
        {
            // 410 Gone — the frontend maps this to the expired/locked pre-order notice.
            return ResponseBuilder.CreateErrorResponse(410, exception.Message, context.Logger, exception);
        }
        catch (GuestSessionExpiredException exception)
        {
            return ResponseBuilder.CreateErrorResponse(410, exception.Message, context.Logger, exception);
        }
        catch (ValidationException exception)
        {
            return ResponseBuilder.CreateErrorCodeResponse(exception);
        }
    }
}
