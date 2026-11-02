using Amazon.DynamoDBv2.DataModel;
using System.Text.Json.Serialization;

namespace APIHandler.Entities.Reports;

[DynamoDBTable("ReportsHistory")]
public class ReportHistoryWaiter : ReportHistoryBase
{
    [JsonPropertyName("waiterId")]
    [DynamoDBProperty("waiterId")]
    public string WaiterId { get; set; } = string.Empty;

    [JsonPropertyName("waiterName")]
    [DynamoDBProperty("waiterName")]
    public string WaiterName { get; set; } = string.Empty;

    [JsonPropertyName("waiterEmail")]
    [DynamoDBProperty("waiterEmail")]
    public string WaiterEmail { get; set; } = string.Empty;

    [JsonPropertyName("workingHours")]
    [DynamoDBProperty("workingHours")]
    public double WorkingHours { get; set; }

    [JsonPropertyName("totalOrders")]
    [DynamoDBProperty("totalOrders")]
    public int TotalOrders { get; set; }

    [JsonPropertyName("avgServiceFeedback")]
    [DynamoDBProperty("avgServiceFeedback")]
    public double AvgServiceFeedback { get; set; }

    [JsonPropertyName("minServiceFeedback")]
    [DynamoDBProperty("minServiceFeedback")]
    public double MinServiceFeedback { get; set; }

    [JsonPropertyName("deltaAvgServiceFeedback")]
    [DynamoDBProperty("deltaAvgServiceFeedback")]
    public double DeltaAvgServiceFeedback { get; set; }

    [JsonPropertyName("deltaTotalOrders")]
    [DynamoDBProperty("deltaTotalOrders")]
    public double DeltaTotalOrders { get; set; }
}
