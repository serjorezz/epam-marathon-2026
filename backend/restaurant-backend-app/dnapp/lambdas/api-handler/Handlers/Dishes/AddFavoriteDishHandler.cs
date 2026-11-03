using Amazon.DynamoDBv2.DataModel;
using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using APIHandler.Constants;
using APIHandler.Entities;
using APIHandler.Helpers;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace APIHandler.Handlers.Dishes;

public class AddFavoriteDishHandler : IApiRequestHandler
{
    private readonly IDynamoDBContext _dbContext;

    public AddFavoriteDishHandler(IDynamoDBContext dbContext)
    {
        _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
    }

    public async Task<APIGatewayProxyResponse> HandleRequest(APIGatewayProxyRequest request, ILambdaContext context)
    {
        var userId = UserContextHelper.GetAuthenticatedUserId(request);
        if (string.IsNullOrWhiteSpace(userId))
        {
            return ResponseBuilder.CreateErrorResponse(401, "Please log in to add dishes to your favorites.", context.Logger);
        }

        if (request.PathParameters == null || !request.PathParameters.TryGetValue("id", out var dishId) || string.IsNullOrWhiteSpace(dishId))
        {
            return ResponseBuilder.CreateErrorResponse(400, "Dish ID is required.", context.Logger);
        }

        var config = new DynamoDBOperationConfig
        {
            OverrideTableName = ResourceNames.CustomerFavoritesTableName
        };

        var favorites = await _dbContext.LoadAsync<CustomerFavorite>(userId, config);
        if (favorites == null)
        {
            favorites = new CustomerFavorite
            {
                UserId = userId,
                DishIds = new List<string>()
            };
        }

        if (!favorites.DishIds.Contains(dishId))
        {
            favorites.DishIds.Add(dishId);
            await _dbContext.SaveAsync(favorites, config);
        }

        return ResponseBuilder.CreateSuccessResponse(new
        {
            message = "Dish added to favorites",
            dishId,
            isFavorite = true
        });
    }
}
