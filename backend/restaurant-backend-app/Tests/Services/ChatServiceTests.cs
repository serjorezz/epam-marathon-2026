using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using APIHandler.Constants;
using APIHandler.Entities;
using APIHandler.Handlers.Chat;
using APIHandler.Models.Chat;
using APIHandler.Models.Reservations;
using APIHandler.Services.Chat;
using APIHandler.Services.Locations;
using APIHandler.Services.Reservations;
using APIHandler.Services.Tables;
using Moq;
using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;
using Xunit;

namespace APIHandler.Tests.Services;

public class ChatServiceTests
{
    private readonly Mock<ITableService> _mockTableService;
    private readonly Mock<IReservationService> _mockReservationService;
    private readonly Mock<ILocationService> _mockLocationService;
    private readonly Mock<ILambdaLogger> _mockLogger;
    private readonly Mock<ILambdaContext> _mockContext;
    private readonly ChatService _chatService;
    private readonly ChatHandler _chatHandler;

    public ChatServiceTests()
    {
        _mockTableService = new Mock<ITableService>();
        _mockReservationService = new Mock<IReservationService>();
        _mockLocationService = new Mock<ILocationService>();
        _mockLogger = new Mock<ILambdaLogger>();
        _mockContext = new Mock<ILambdaContext>();
        _mockContext.Setup(c => c.Logger).Returns(_mockLogger.Object);

        _chatService = new ChatService(
            _mockTableService.Object,
            _mockReservationService.Object,
            _mockLocationService.Object,
            null);

        _chatHandler = new ChatHandler(_chatService);
    }

    [Fact]
    public async Task ProcessChatAsync_EmptyMessage_ReturnsWelcomeMessage()
    {
        var request = new ChatRequest { Message = "" };
        var response = await _chatService.ProcessChatAsync(request, null, _mockLogger.Object);

        Assert.NotNull(response);
        Assert.Contains("Welcome to Green & Tasty", response.Reply);
    }

    [Fact]
    public async Task ProcessChatAsync_AvailabilityInquiry_ChecksTablesAndReturnsSlots()
    {
        var tables = new List<Table>
        {
            new() { Id = "tbl-1", Capacity = 4, LocationId = "loc-1", TableNumber = 1 }
        };

        _mockTableService
            .Setup(t => t.GetAvailableTablesAsync(null, It.IsAny<int>(), It.IsAny<DateTime>()))
            .ReturnsAsync(tables);

        var request = new ChatRequest
        {
            Message = "Do you have any available tables for 2 people tomorrow?"
        };

        var response = await _chatService.ProcessChatAsync(request, null, _mockLogger.Object);

        Assert.NotNull(response);
        Assert.Contains("open tables", response.Reply, StringComparison.OrdinalIgnoreCase);
        _mockTableService.Verify(t => t.GetAvailableTablesAsync(null, 2, It.IsAny<DateTime>()), Times.AtLeastOnce);
    }

    [Fact]
    public async Task ProcessChatAsync_ReservationBooking_CreatesReservationWhenDetailsSupplied()
    {
        var tables = new List<Table>
        {
            new() { Id = "tbl-10", Capacity = 4, LocationId = "loc-rustaveli", TableNumber = 5 }
        };

        _mockTableService
            .Setup(t => t.GetAvailableTablesAsync(null, It.IsAny<int>(), It.IsAny<DateTime>()))
            .ReturnsAsync(tables);

        var fakeReservationResponse = new ReservationResponse
        {
            Id = "res-12345",
            TableId = "tbl-10",
            StartTime = DateTime.UtcNow.AddDays(1).Date.AddHours(18),
            EndTime = DateTime.UtcNow.AddDays(1).Date.AddHours(19).AddMinutes(30),
            GuestCount = 2,
            Address = "48 Rustaveli Avenue",
            RestaurantName = "Green & Tasty",
            WaiterId = "waiter-1",
            Status = ReservationStatus.Reserved
        };

        _mockReservationService
            .Setup(r => r.CreateReservationAsync(It.IsAny<CreateReservationRequest>(), It.IsAny<string>(), false, It.IsAny<ILambdaLogger>()))
            .ReturnsAsync(fakeReservationResponse);

        var request = new ChatRequest
        {
            Message = "Please confirm table for John Doe tomorrow 18:00 for 2 guests"
        };

        var response = await _chatService.ProcessChatAsync(request, "user-sub-1", _mockLogger.Object);

        Assert.NotNull(response);
        Assert.True(response.Reservation != null, $"Reply was: {response.Reply}");
        Assert.Equal("res-12345", response.Reservation.Id);
        Assert.Equal(2, response.Reservation.GuestCount);
        Assert.Equal("48 Rustaveli Avenue", response.Reservation.Address);
    }

    [Fact]
    public async Task ChatHandler_HandleRequest_ValidMessage_Returns200WithReply()
    {
        var payload = new ChatRequest
        {
            Message = "Hello, what time do you open?"
        };

        var apiRequest = new APIGatewayProxyRequest
        {
            HttpMethod = "POST",
            Body = JsonSerializer.Serialize(payload)
        };

        var response = await _chatHandler.HandleRequest(apiRequest, _mockContext.Object);

        Assert.Equal(200, response.StatusCode);
        var chatResp = JsonSerializer.Deserialize<ChatResponse>(response.Body, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        Assert.NotNull(chatResp);
        Assert.False(string.IsNullOrWhiteSpace(chatResp.Reply));
    }

    [Fact]
    public async Task ChatHandler_HandleRequest_EmptyBody_Returns400()
    {
        var apiRequest = new APIGatewayProxyRequest
        {
            HttpMethod = "POST",
            Body = ""
        };

        var response = await _chatHandler.HandleRequest(apiRequest, _mockContext.Object);
        Assert.Equal(400, response.StatusCode);
    }
}
