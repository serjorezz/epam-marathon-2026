using Amazon.Lambda.APIGatewayEvents;
using APIHandler.Models.Users;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;

namespace APIHandler.Helpers;

public static class UserContextHelper
{
    public static string? GetAuthenticatedUserId(APIGatewayProxyRequest request)
    {
        if (request.RequestContext?.Authorizer?.Claims is not null &&
            request.RequestContext.Authorizer.Claims.TryGetValue("sub", out var userId) &&
            !string.IsNullOrWhiteSpace(userId))
        {
            return userId;
        }

        if (request.Headers is not null)
        {
            var authHeader = request.Headers
                .FirstOrDefault(h => h.Key.Equals("Authorization", StringComparison.OrdinalIgnoreCase)).Value;

            if (!string.IsNullOrWhiteSpace(authHeader) && authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            {
                var token = authHeader["Bearer ".Length..].Trim();
                try
                {
                    var handler = new JwtSecurityTokenHandler();
                    var jwt = handler.ReadJwtToken(token);
                    var sub = jwt.Claims.FirstOrDefault(c => c.Type == "sub")?.Value;
                    if (!string.IsNullOrWhiteSpace(sub))
                    {
                        return sub;
                    }
                }
                catch
                {
                    // Invalid/unparseable token - treat as unauthenticated
                }
            }
        }

        return null;
    }

    public static bool IsRequestFromWaiter(APIGatewayProxyRequest request)
    {
        return request.RequestContext?.Authorizer?.Claims is not null &&
            request.RequestContext.Authorizer.Claims.TryGetValue("cognito:groups", out var groups) &&
            groups.Split(',')
            .Select(x => x.Trim())
            .Contains(Roles.Waiter.ToString());
    }
}
