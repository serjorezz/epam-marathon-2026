using Amazon.DynamoDBv2.DataModel;
using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using APIHandler.Constants;
using APIHandler.Entities;
using APIHandler.Helpers;
using System;
using System.Threading.Tasks;

namespace APIHandler.Handlers.Dishes;

public class RemoveFavoriteDishHandler : IApiRequestHandler
{
    private readonly IDynamoDBContext _dbContext;

    public RemoveFavoriteDishHandler(IDynamoDBContext dbContext)
    {
        _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
    }

    public async Task<APIGatewayProxyResponse> HandleRequest(APIGatewayProxyRequest request, ILambdaContext context)
    {
        var userId = UserContextHelper.GetAuthenticatedUserId(request);
        if (string.IsNullOrWhiteSpace(userId))
        {
            return ResponseBuilder.CreateErrorResponse(401, "Please log in to manage your favorite dishes.", context.Logger);
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
        if (favorites != null && favorites.DishIds.Contains(dishId))
        {
            favorites.DishIds.Remove(dishId);
            if (favorites.DishIds.Count == 0)
            {
                await _dbContext.DeleteAsync(favorites, config);
            }
            else
            {
                await _dbContext.SaveAsync(favorites, config);
            }
        }

        return ResponseBuilder.CreateSuccessResponse(new
        {
            message = "Dish removed from favorites",
            dishId,
            isFavorite = false
        });
    }
}
