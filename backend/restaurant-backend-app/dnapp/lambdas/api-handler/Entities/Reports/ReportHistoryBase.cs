using Amazon.DynamoDBv2.DataModel;
using APIHandler.Constants.Reports;
using System;
using System.Text.Json.Serialization;

namespace APIHandler.Entities.Reports;

[JsonDerivedType(typeof(ReportHistoryWaiter))]
[JsonDerivedType(typeof(ReportHistoryLocation))]
public class ReportHistoryBase
{
    [DynamoDBHashKey("id")]
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("reportType")]
    [DynamoDBProperty("reportType")]
    public ReportType ReportType { get; set; }

    [DynamoDBIgnore]
    [JsonIgnore]
    public DateOnly StartDate { get; set; }

    [DynamoDBIgnore]
    [JsonIgnore]
    public DateOnly EndDate { get; set; }

    [JsonPropertyName("startDate")]
    [DynamoDBProperty("startDate")]
    public string StartDateString
    {
        get => StartDate.ToString("yyyy-MM-dd");
        set => StartDate = DateOnly.Parse(value);
    }

    [JsonPropertyName("endDate")]
    [DynamoDBProperty("endDate")]
    public string EndDateString
    {
        get => EndDate.ToString("yyyy-MM-dd");
        set => EndDate = DateOnly.Parse(value);
    }

    [JsonPropertyName("userId")]
    [DynamoDBProperty("userId")]
    [DynamoDBGlobalSecondaryIndexHashKey("UserIdIndex")]
    public string UserId { get; set; } = string.Empty;

    [JsonPropertyName("locationId")]
    [DynamoDBProperty("locationId")]
    public string LocationId { get; set; } = string.Empty;

    [JsonPropertyName("locationName")]
    [DynamoDBProperty("locationName")]
    public string LocationName { get; set; } = string.Empty;
}
