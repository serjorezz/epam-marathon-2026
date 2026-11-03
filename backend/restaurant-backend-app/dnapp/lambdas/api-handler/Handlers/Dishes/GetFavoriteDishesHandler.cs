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

public class GetFavoriteDishesHandler : IApiRequestHandler
{
    private readonly IDynamoDBContext _dbContext;

    public GetFavoriteDishesHandler(IDynamoDBContext dbContext)
    {
        _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
    }

    public async Task<APIGatewayProxyResponse> HandleRequest(APIGatewayProxyRequest request, ILambdaContext context)
    {
        var userId = UserContextHelper.GetAuthenticatedUserId(request);
        if (string.IsNullOrWhiteSpace(userId))
        {
            return ResponseBuilder.CreateSuccessResponse(new
            {
                dishIds = new List<string>()
            });
        }

        var config = new DynamoDBOperationConfig
        {
            OverrideTableName = ResourceNames.CustomerFavoritesTableName
        };

        var favorites = await _dbContext.LoadAsync<CustomerFavorite>(userId, config);
        return ResponseBuilder.CreateSuccessResponse(new
        {
            dishIds = favorites?.DishIds ?? new List<string>()
        });
    }
}
