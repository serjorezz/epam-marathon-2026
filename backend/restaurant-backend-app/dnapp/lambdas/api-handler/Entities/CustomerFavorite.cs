using Amazon.DynamoDBv2.DataModel;
using System.Collections.Generic;

namespace APIHandler.Entities;

[DynamoDBTable("CustomerFavorites")]
public class CustomerFavorite
{
    [DynamoDBHashKey("userId")]
    public string UserId { get; set; } = string.Empty;

    [DynamoDBProperty("dishIds")]
    public List<string> DishIds { get; set; } = new();
}
