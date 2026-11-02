using System;
using System.Collections.Generic;
using System.Text.Json;
using APIHandler.Constants.Reports;
using APIHandler.Entities.Reports;
using Xunit;

namespace APIHandler.Tests.Services;

public class ReportSerializationTests
{
    [Fact]
    public void ReportHistoryBase_And_DerivedClasses_Serialize_Without_Throwing()
    {
        var waiterReport = new ReportHistoryWaiter
        {
            Id = "rep-1",
            ReportType = ReportType.Service,
            StartDate = new DateOnly(2026, 10, 1),
            EndDate = new DateOnly(2026, 11, 1),
            UserId = "user-123",
            LocationId = "loc-1",
            LocationName = "Rustaveli",
            WaiterId = "waiter-1",
            WaiterName = "Test Waiter",
            WaiterEmail = "waiter@green-tasty.com",
            WorkingHours = 40,
            TotalOrders = 80,
            AvgServiceFeedback = 4.8,
            MinServiceFeedback = 4.0,
            DeltaAvgServiceFeedback = 0.2,
            DeltaTotalOrders = 10
        };

        var locationReport = new ReportHistoryLocation
        {
            Id = "rep-2",
            ReportType = ReportType.Sales,
            StartDate = new DateOnly(2026, 10, 1),
            EndDate = new DateOnly(2026, 11, 1),
            UserId = "user-123",
            LocationId = "loc-1",
            LocationName = "Rustaveli",
            TotalOrders = 150,
            AvgCuisineFeedback = 4.6,
            MinCuisineFeedback = 3.9,
            Revenue = 12000m,
            DeltaAvgCuisineFeedback = 0.1,
            DeltaRevenue = 1500m
        };

        var baseList = new List<ReportHistoryBase> { waiterReport, locationReport };

        var json = JsonSerializer.Serialize(baseList);
        Assert.NotNull(json);
        Assert.Contains("Test Waiter", json);
        Assert.Contains("Rustaveli", json);
    }
}
