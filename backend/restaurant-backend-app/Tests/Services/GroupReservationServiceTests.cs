using APIHandler.Constants.Orders;
using APIHandler.Repositories.Orders;
using APIHandler.Constants;
using APIHandler.Entities;
using APIHandler.Exceptions;
using APIHandler.Models.GroupReservation;
using APIHandler.Repositories.GroupReservations;
using APIHandler.Repositories.GuestSessions;
using APIHandler.Repositories.Reservations;
using APIHandler.Repositories.Tables;
using APIHandler.Services.Auth;
using APIHandler.Services.GroupReservations;
using APIHandler.Services.Locations;
using AutoFixture.Xunit2;
using Moq;

namespace APIHandler.Tests.Services;

public class GroupReservationServiceTests
{
    private readonly Mock<IGroupReservationRepository> _groupReservationRepositoryMock = new();
    private readonly Mock<ITableRepository> _tableRepositoryMock = new();
    private readonly Mock<IReservationRepository> _reservationRepositoryMock = new();
    private readonly Mock<IGuestSessionRepository> _guestSessionRepositoryMock = new();
    private readonly Mock<IUserService> _userServiceMock = new();
    private readonly Mock<ILocationService> _locationServiceMock = new();
    private readonly Mock<IOrderRepository> _orderRepositoryMock = new();

    private readonly GroupReservationService _service;

    public GroupReservationServiceTests()
    {
        _service = new GroupReservationService(
            _groupReservationRepositoryMock.Object,
            _tableRepositoryMock.Object,
            _reservationRepositoryMock.Object,
            _guestSessionRepositoryMock.Object,
            _userServiceMock.Object,
            _locationServiceMock.Object,
            _orderRepositoryMock.Object);
    }

    [Theory]
    [AutoData]
    public async Task GetGroupReservationByTokenAsync_ValidInput_ReturnsGroupReservationInfo(
        GroupReservation groupReservation,
        Table table,
        Reservation reservation,
        Location location,
        string expectedUserName)
    {
        groupReservation.ReservationId = reservation.Id;
        groupReservation.Status = GroupReservationStatus.Open;
        reservation.TableId = table.Id;
        table.LocationId = location.Id;

        _groupReservationRepositoryMock
            .Setup(r => r.GetGroupReservationByTokenAsync(groupReservation.ReservationToken))
            .ReturnsAsync(groupReservation);

        _reservationRepositoryMock
            .Setup(r => r.GetReservationByIdAsync(reservation.Id))
            .ReturnsAsync(reservation);

        _guestSessionRepositoryMock
            .Setup(r => r.CountByGroupReservationId(groupReservation.GroupReservationId))
            .ReturnsAsync(0);

        _tableRepositoryMock
            .Setup(r => r.GetTableAsync(table.Id))
            .ReturnsAsync(table);

        _locationServiceMock
            .Setup(s => s.GetLocationByIdAsync(table.LocationId))
            .ReturnsAsync(location);

        _userServiceMock
            .Setup(s => s.GetUserName(reservation.CustomerId!))
            .ReturnsAsync(expectedUserName);

        var result = await _service.GetGroupReservationByTokenAsync(groupReservation.ReservationToken);

        Assert.Equal(groupReservation.GroupReservationId, result.GroupReservationId);
        Assert.Equal(table.LocationId, result.LocationId);
        Assert.Equal(reservation.GuestCount, result.MaxGuestCount);
        Assert.Equal(reservation.StartTime, result.StartTime);
        Assert.Equal(reservation.EndTime, result.EndTime);
        Assert.Equal(table.TableNumber, result.TableNumber);
        Assert.Equal("Green & Tasty", result.RestaurantName);
        Assert.Equal(location.Address, result.LocationAddress);
        Assert.Equal(expectedUserName, result.InviterName);
    }

    [Theory]
    [AutoData]
    public async Task GetGroupReservationByTokenAsync_InvalidToken_ThrowsNotFound(string token)
    {
        _groupReservationRepositoryMock
            .Setup(r => r.GetGroupReservationByTokenAsync(token))
            .ReturnsAsync((GroupReservation?)null);

        await Assert.ThrowsAsync<GroupReservationNotFoundException>(() => _service.GetGroupReservationByTokenAsync(token));
    }

    [Theory]
    [InlineAutoData(GroupReservationStatus.Closed)]
    [InlineAutoData(GroupReservationStatus.Submitted)]
    public async Task GetGroupReservationByTokenAsync_GroupReservationIsNotOpen_ThrowsException(
        GroupReservationStatus status,
        GroupReservation groupReservation)
    {
        groupReservation.Status = status;

        _groupReservationRepositoryMock
            .Setup(r => r.GetGroupReservationByTokenAsync(groupReservation.ReservationToken))
            .ReturnsAsync(groupReservation);

        await Assert.ThrowsAsync<GroupReservationExpiredException>(() => _service.GetGroupReservationByTokenAsync(groupReservation.ReservationToken));
    }

    [Theory]
    [AutoData]
    public async Task GetGroupReservationByTokenAsync_WhenGuestCountIsMax_ThrowsGuestLimitExceeded(GroupReservation groupReservation, Reservation reservation)
    {
        groupReservation.Status = GroupReservationStatus.Open;
        groupReservation.ReservationId = reservation.Id;

        _groupReservationRepositoryMock
            .Setup(r => r.GetGroupReservationByTokenAsync(groupReservation.ReservationToken))
            .ReturnsAsync(groupReservation);

        _reservationRepositoryMock
            .Setup(r => r.GetReservationByIdAsync(reservation.Id))
            .ReturnsAsync(reservation);

        _guestSessionRepositoryMock
            .Setup(r => r.CountByGroupReservationId(groupReservation.GroupReservationId))
            .ReturnsAsync(reservation.GuestCount);

        await Assert.ThrowsAsync<GuestLimitExceededException>(() => _service.GetGroupReservationByTokenAsync(groupReservation.ReservationToken));
    }

    [Theory]
    [AutoData]
    public async Task CloseGroupReservationAsync_ValidInput_UpdatesGroupReservationStatus(GroupReservation groupReservation)
    {
        _groupReservationRepositoryMock
            .Setup(r => r.GetByReservationIdAsync(groupReservation.ReservationId))
            .ReturnsAsync(groupReservation);

        GroupReservation? savedGroupReservation = null;
        _groupReservationRepositoryMock
            .Setup(r => r.SaveGroupReservationAsync(It.IsAny<GroupReservation>()))
            .Callback<GroupReservation>(r => savedGroupReservation = r);

        await _service.CloseGroupReservationAsync(groupReservation.ReservationId);

        Assert.NotNull(savedGroupReservation);
        Assert.Equal(GroupReservationStatus.Closed, savedGroupReservation.Status);
    }

    [Theory]
    [AutoData]
    public async Task CloseGroupReservationAsync_GroupReservationNotFound_DoesNotThrowException(string reservationId)
    {
        _groupReservationRepositoryMock
            .Setup(r => r.GetByReservationIdAsync(reservationId))
            .ReturnsAsync((GroupReservation?)null);

        await _service.CloseGroupReservationAsync(reservationId);
    }

    [Theory]
    [AutoData]
    public async Task GetGroupReservationInviteTokenAsync_ValidInput_ReturnsToken(Reservation reservation, GroupReservation groupReservation)
    {
        reservation.Status = ReservationStatus.Reserved;
        reservation.GuestCount = 3;
        groupReservation.ReservationId = reservation.Id;
        groupReservation.Status = GroupReservationStatus.Open;

        _reservationRepositoryMock
            .Setup(r => r.GetReservationByIdAsync(reservation.Id))
            .ReturnsAsync(reservation);

        _groupReservationRepositoryMock
            .Setup(r => r.GetByReservationIdAsync(reservation.Id))
            .ReturnsAsync(groupReservation);

        GetGroupInviteTokenResponse result = await _service.GetGroupReservationInviteTokenAsync(reservation.Id);

        Assert.Equal(groupReservation.ReservationToken, result.Token);
    }

    [Theory]
    [AutoData]
    public async Task GetGroupReservationInviteTokenAsync_InvalidReservationId_ThrowsNotFound(string reservationId)
    {
        _reservationRepositoryMock
            .Setup(r => r.GetReservationByIdAsync(reservationId))
            .ReturnsAsync((Reservation?)null);

        await Assert.ThrowsAsync<ReservationNotFoundException>(() => _service.GetGroupReservationInviteTokenAsync(reservationId));
    }

    [Theory]
    [AutoData]
    public async Task GetGroupReservationInviteTokenAsync_OneGuest_ThrowsValidationException(Reservation reservation)
    {
        reservation.Status = ReservationStatus.Reserved;
        reservation.GuestCount = 1;

        _reservationRepositoryMock
            .Setup(r => r.GetReservationByIdAsync(reservation.Id))
            .ReturnsAsync(reservation);

        await Assert.ThrowsAsync<ValidationException>(() => _service.GetGroupReservationInviteTokenAsync(reservation.Id));
    }

    [Theory]
    [InlineAutoData(ReservationStatus.Completed)]
    [InlineAutoData(ReservationStatus.Cancelled)]
    [InlineAutoData(ReservationStatus.InProgress)]
    public async Task GetGroupReservationInviteTokenAsync_StatusIsNotReserved_ThrowsValidationException(ReservationStatus reservationStatus, Reservation reservation)
    {
        reservation.Status = reservationStatus;
        reservation.GuestCount = 1;

        _reservationRepositoryMock
            .Setup(r => r.GetReservationByIdAsync(reservation.Id))
            .ReturnsAsync(reservation);

        await Assert.ThrowsAsync<ValidationException>(() => _service.GetGroupReservationInviteTokenAsync(reservation.Id));
    }

    [Theory]
    [InlineAutoData(GroupReservationStatus.Closed, typeof(GroupReservationExpiredException))]
    [InlineAutoData(GroupReservationStatus.Submitted, typeof(GroupReservationSubmittedException))]
    public async Task GetGroupReservationInviteTokenAsync_GroupStatusIsNotOpen_ThrowsException(GroupReservationStatus status, Type type, Reservation reservation, GroupReservation groupReservation)
    {
        reservation.Status = ReservationStatus.Reserved;
        reservation.GuestCount = 3;
        groupReservation.ReservationId = reservation.Id;
        groupReservation.Status = status;

        _reservationRepositoryMock
            .Setup(r => r.GetReservationByIdAsync(reservation.Id))
            .ReturnsAsync(reservation);

        _groupReservationRepositoryMock
            .Setup(r => r.GetByReservationIdAsync(reservation.Id))
            .ReturnsAsync(groupReservation);

        await Assert.ThrowsAsync(type, () => _service.GetGroupReservationInviteTokenAsync(reservation.Id));
    }

    [Fact]
    public async Task GetOwnerGuestSessionIdAsync_WhenOwnerSessionExists_ReturnsExistingId()
    {
        var userId = "user-123";
        var reservationId = "res-1";
        var reservation = new Reservation { Id = reservationId, CustomerId = userId, TableId = "table-1", WaiterId = "waiter-1" };
        var groupReservation = new GroupReservation { GroupReservationId = "group-1", ReservationId = reservationId, ReservationToken = "token" };
        var existingSession = new GuestSession
        {
            Id = "session-owner",
            GuestName = "Owner",
            GroupReservationId = groupReservation.GroupReservationId,
            IsOwnerSession = true,
            OwnerUserId = userId,
            Dishes = []
        };

        _reservationRepositoryMock.Setup(r => r.GetReservationByIdAsync(reservationId)).ReturnsAsync(reservation);
        _groupReservationRepositoryMock.Setup(r => r.GetByReservationIdAsync(reservationId)).ReturnsAsync(groupReservation);
        _guestSessionRepositoryMock.Setup(r => r.GetAllByGroupReservationIdAsync(groupReservation.GroupReservationId))
            .ReturnsAsync([existingSession]);

        var result = await _service.GetOwnerGuestSessionIdAsync(userId, reservationId);

        Assert.Equal("session-owner", result.GuestSessionId);
    }

    [Fact]
    public async Task GetOwnerGuestSessionIdAsync_WhenOwnerSessionDoesNotExist_CreatesAndReturnsNewId()
    {
        var userId = "user-123";
        var reservationId = "res-1";
        var reservation = new Reservation { Id = reservationId, CustomerId = userId, TableId = "table-1", WaiterId = "waiter-1" };
        var groupReservation = new GroupReservation { GroupReservationId = "group-1", ReservationId = reservationId, ReservationToken = "token" };

        _reservationRepositoryMock.Setup(r => r.GetReservationByIdAsync(reservationId)).ReturnsAsync(reservation);
        _groupReservationRepositoryMock.Setup(r => r.GetByReservationIdAsync(reservationId)).ReturnsAsync(groupReservation);
        _guestSessionRepositoryMock.Setup(r => r.GetAllByGroupReservationIdAsync(groupReservation.GroupReservationId))
            .ReturnsAsync([]);

        var result = await _service.GetOwnerGuestSessionIdAsync(userId, reservationId);

        Assert.False(string.IsNullOrWhiteSpace(result.GuestSessionId));
        _guestSessionRepositoryMock.Verify(r => r.SaveAsync(It.Is<GuestSession>(s =>
            s.IsOwnerSession && s.OwnerUserId == userId && s.GroupReservationId == groupReservation.GroupReservationId)), Times.Once);
    }

    [Fact]
    public async Task GetOwnerGuestSessionIdAsync_ReservationNotFound_ThrowsReservationNotFoundException()
    {
        _reservationRepositoryMock.Setup(r => r.GetReservationByIdAsync("res-404")).ReturnsAsync((Reservation?)null);

        await Assert.ThrowsAsync<ReservationNotFoundException>(() => _service.GetOwnerGuestSessionIdAsync("user-1", "res-404"));
    }

    [Fact]
    public async Task GetOwnerGuestSessionIdAsync_UserIsNotOwner_ThrowsActionForbiddenException()
    {
        var reservation = new Reservation { Id = "res-1", CustomerId = "other-user", TableId = "table-1", WaiterId = "waiter-1" };
        _reservationRepositoryMock.Setup(r => r.GetReservationByIdAsync("res-1")).ReturnsAsync(reservation);

        await Assert.ThrowsAsync<ActionForbiddenException>(() => _service.GetOwnerGuestSessionIdAsync("user-1", "res-1"));
    }

    [Fact]
    public async Task SubmitGroupPreOrderAsync_Success_ConsolidatesDishesAndUpdatesStatus()
    {
        var userId = "user-1";
        var groupReservationId = "group-1";
        var reservationId = "res-1";

        var groupReservation = new GroupReservation
        {
            GroupReservationId = groupReservationId,
            ReservationId = reservationId,
            ReservationToken = "token",
            Status = GroupReservationStatus.Open
        };
        var reservation = new Reservation { Id = reservationId, CustomerId = userId, TableId = "table-1", WaiterId = "waiter-1" };
        var order = new Order
        {
            OrderId = "order-1",
            CustomerId = userId,
            ReservationId = reservationId,
            ReservationAddress = "addr",
            ReservationTime = "time",
            Status = OrderStatus.Created,
            Dishes = []
        };

        var session1 = new GuestSession
        {
            Id = "s1",
            GuestName = "Guest 1",
            GroupReservationId = groupReservationId,
            IsSubmitted = true,
            Dishes =
            [
                new OrderItem { DishId = "dish-1", Quantity = 2 },
                new OrderItem { DishId = "dish-2", Quantity = 1 }
            ]
        };

        var session2 = new GuestSession
        {
            Id = "s2",
            GuestName = "Guest 2",
            GroupReservationId = groupReservationId,
            IsSubmitted = true,
            Dishes =
            [
                new OrderItem { DishId = "dish-1", Quantity = 1 },
                new OrderItem { DishId = "dish-3", Quantity = 4 }
            ]
        };

        var sessionUnsubmitted = new GuestSession
        {
            Id = "s3",
            GuestName = "Guest 3",
            GroupReservationId = groupReservationId,
            IsSubmitted = false,
            Dishes =
            [
                new OrderItem { DishId = "dish-99", Quantity = 10 }
            ]
        };

        _groupReservationRepositoryMock.Setup(r => r.GetGroupReservationByIdAsync(groupReservationId)).ReturnsAsync(groupReservation);
        _reservationRepositoryMock.Setup(r => r.GetReservationByIdAsync(reservationId)).ReturnsAsync(reservation);
        _orderRepositoryMock.Setup(r => r.GetOrderByReservationIdAsync(reservationId)).ReturnsAsync(order);
        _guestSessionRepositoryMock.Setup(r => r.GetAllByGroupReservationIdAsync(groupReservationId))
            .ReturnsAsync([session1, session2, sessionUnsubmitted]);

        var result = await _service.SubmitGroupPreOrderAsync(userId, groupReservationId, reservationId);

        Assert.Equal(3, result.Count);
        var d1 = result.First(x => x.DishId == "dish-1");
        Assert.Equal(3, d1.Quantity);
        var d2 = result.First(x => x.DishId == "dish-2");
        Assert.Equal(1, d2.Quantity);
        var d3 = result.First(x => x.DishId == "dish-3");
        Assert.Equal(4, d3.Quantity);

        Assert.Equal(OrderStatus.SubmittedByCustomer, order.Status);
        Assert.Equal(GroupReservationStatus.Submitted, groupReservation.Status);
        _orderRepositoryMock.Verify(r => r.SaveOrderAsync(order), Times.Once);
        _groupReservationRepositoryMock.Verify(r => r.SaveGroupReservationAsync(groupReservation), Times.Once);
    }

    [Fact]
    public async Task SubmitGroupPreOrderAsync_NoSubmittedSessions_ThrowsValidationException()
    {
        var userId = "user-1";
        var groupReservation = new GroupReservation { GroupReservationId = "g-1", ReservationId = "res-1", ReservationToken = "token" };
        var reservation = new Reservation { Id = "res-1", CustomerId = userId, TableId = "table-1", WaiterId = "waiter-1" };
        var order = new Order
        {
            OrderId = "ord-1",
            CustomerId = userId,
            ReservationId = "res-1",
            ReservationAddress = "addr",
            ReservationTime = "time",
            Dishes = []
        };

        _groupReservationRepositoryMock.Setup(r => r.GetGroupReservationByIdAsync("g-1")).ReturnsAsync(groupReservation);
        _reservationRepositoryMock.Setup(r => r.GetReservationByIdAsync("res-1")).ReturnsAsync(reservation);
        _orderRepositoryMock.Setup(r => r.GetOrderByReservationIdAsync("res-1")).ReturnsAsync(order);
        _guestSessionRepositoryMock.Setup(r => r.GetAllByGroupReservationIdAsync("g-1")).ReturnsAsync([]);

        await Assert.ThrowsAsync<ValidationException>(() => _service.SubmitGroupPreOrderAsync(userId, "g-1", "res-1"));
    }

    [Fact]
    public async Task SubmitGroupPreOrderAsync_OrderNotFound_ThrowsValidationException()
    {
        var userId = "user-1";
        var groupReservation = new GroupReservation { GroupReservationId = "g-1", ReservationId = "res-1", ReservationToken = "token" };
        var reservation = new Reservation { Id = "res-1", CustomerId = userId, TableId = "table-1", WaiterId = "waiter-1" };

        _groupReservationRepositoryMock.Setup(r => r.GetGroupReservationByIdAsync("g-1")).ReturnsAsync(groupReservation);
        _reservationRepositoryMock.Setup(r => r.GetReservationByIdAsync("res-1")).ReturnsAsync(reservation);
        _orderRepositoryMock.Setup(r => r.GetOrderByReservationIdAsync("res-1")).ReturnsAsync((Order?)null);

        await Assert.ThrowsAsync<ValidationException>(() => _service.SubmitGroupPreOrderAsync(userId, "g-1", "res-1"));
    }
}
