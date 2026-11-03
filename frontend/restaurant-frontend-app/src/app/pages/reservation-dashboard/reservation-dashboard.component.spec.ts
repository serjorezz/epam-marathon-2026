import { ComponentFixture, TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { ReservationDashboardComponent } from "./reservation-dashboard.component";
import { API_BASE_URL } from "@app/shared/config/api-base-url.token";
import { provideRouter } from "@angular/router";
import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { ReservationCustomer, ReservationStatusCustomer } from "@app/models/reservations/reservation.model";
import { FeedbackReservationResponseItem } from "@app/models/feedbacks/feedback-reservation-response-item.model";
import { ReservationService } from "@app/services/reservation/reservation.service";

describe("ReservationDashboardComponent", () => {
  let component: ReservationDashboardComponent;
  let fixture: ComponentFixture<ReservationDashboardComponent>;

  const mockReservations: ReservationCustomer[] = [
    {
      id: "res-1",
      tableId: "tab-1",
      startTime: new Date("2026-11-10T18:00:00Z"),
      endTime: new Date("2026-11-10T19:30:00Z"),
      guestCount: 4,
      status: ReservationStatusCustomer.Reserved,
      restaurantName: "Green & Tasty Rustaveli",
      locationAddress: "48 Rustaveli Avenue",
      waiterId: "w-1",
    },
    {
      id: "res-2",
      tableId: "tab-2",
      startTime: new Date("2026-11-05T12:00:00Z"),
      endTime: new Date("2026-11-05T13:30:00Z"),
      guestCount: 2,
      status: ReservationStatusCustomer.InProgress,
      restaurantName: "Green & Tasty Agmashenebeli",
      locationAddress: "112 Agmashenebeli Avenue",
      waiterId: "w-2",
    },
    {
      id: "res-3",
      tableId: "tab-3",
      startTime: new Date("2026-11-15T20:00:00Z"),
      endTime: new Date("2026-11-15T21:30:00Z"),
      guestCount: 8,
      status: ReservationStatusCustomer.Cancelled,
      restaurantName: "Green & Tasty Pekini",
      locationAddress: "31 Pekini Avenue",
      waiterId: "w-3",
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        { provide: API_BASE_URL, useValue: "https://test.api" },
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
      imports: [ReservationDashboardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ReservationDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
    expect(component.selectedSort()).toBe("date-asc");
    expect(component.selectedStatus()).toBeNull();
  });

  it("should sort reservations by date/time ascending by default", () => {
    component.reservations.set([...mockReservations]);
    const sorted = component.sortedReservations();

    expect(sorted.map(r => r.id)).toEqual(["res-2", "res-1", "res-3"]);
  });

  it("should sort reservations by date/time descending when selected", () => {
    component.reservations.set([...mockReservations]);
    component.selectedSort.set("date-desc");
    const sorted = component.sortedReservations();

    expect(sorted.map(r => r.id)).toEqual(["res-3", "res-1", "res-2"]);
  });

  it("should sort reservations by guest count descending and ascending", () => {
    component.reservations.set([...mockReservations]);

    component.selectedSort.set("guests-desc");
    let sorted = component.sortedReservations();
    expect(sorted.map(r => r.id)).toEqual(["res-3", "res-1", "res-2"]);

    component.selectedSort.set("guests-asc");
    sorted = component.sortedReservations();
    expect(sorted.map(r => r.id)).toEqual(["res-2", "res-1", "res-3"]);
  });

  it("should sort reservations by restaurant name alphabetically", () => {
    component.reservations.set([...mockReservations]);

    component.selectedSort.set("restaurant-asc");
    let sorted = component.sortedReservations();
    // Agmashenebeli (res-2), Pekini (res-3), Rustaveli (res-1)
    expect(sorted.map(r => r.id)).toEqual(["res-2", "res-3", "res-1"]);

    component.selectedSort.set("restaurant-desc");
    sorted = component.sortedReservations();
    // Rustaveli (res-1), Pekini (res-3), Agmashenebeli (res-2)
    expect(sorted.map(r => r.id)).toEqual(["res-1", "res-3", "res-2"]);
  });

  it("should update selectedSort on sort change event", () => {
    const mockEvent = {
      target: { value: "guests-desc" } as unknown as HTMLSelectElement,
    } as unknown as Event;

    component.onSortChanged(mockEvent);
    expect(component.selectedSort()).toBe("guests-desc");
  });

  it("should filter reservations by selected status category", () => {
    component.reservations.set([...mockReservations]);
    expect(component.sortedReservations().length).toBe(3);

    // Filter Reserved
    component.onStatusSelected(ReservationStatusCustomer.Reserved);
    expect(component.selectedStatus()).toBe(ReservationStatusCustomer.Reserved);
    expect(component.sortedReservations().length).toBe(1);
    expect(component.sortedReservations()[0].id).toBe("res-1");

    // Filter InProgress
    component.onStatusSelected(ReservationStatusCustomer.InProgress);
    expect(component.selectedStatus()).toBe(ReservationStatusCustomer.InProgress);
    expect(component.sortedReservations().length).toBe(1);
    expect(component.sortedReservations()[0].id).toBe("res-2");

    // Filter Cancelled
    component.onStatusSelected(ReservationStatusCustomer.Cancelled);
    expect(component.selectedStatus()).toBe(ReservationStatusCustomer.Cancelled);
    expect(component.sortedReservations().length).toBe(1);
    expect(component.sortedReservations()[0].id).toBe("res-3");
  });

  it("should toggle off status category filter when clicking the active category", () => {
    component.reservations.set([...mockReservations]);

    component.onStatusSelected(ReservationStatusCustomer.Reserved);
    expect(component.selectedStatus()).toBe(ReservationStatusCustomer.Reserved);
    expect(component.sortedReservations().length).toBe(1);

    // Click again to toggle off
    component.onStatusSelected(ReservationStatusCustomer.Reserved);
    expect(component.selectedStatus()).toBeNull();
    expect(component.sortedReservations().length).toBe(3);
  });

  it("should display 'No reservations found' when status filter matches 0 bookings", () => {
    component.reservationsLoaded.set(true);
    component.reservations.set([mockReservations[2]]); // only Cancelled reservation
    component.onStatusSelected(ReservationStatusCustomer.Reserved);
    fixture.detectChanges();

    const emptyMsg = fixture.nativeElement.querySelector(".reservation-empty");
    expect(emptyMsg).toBeTruthy();
    expect(emptyMsg.textContent).toContain("No reservations found");
  });

  it("should only request feedback for eligible reservations and skip Reserved and Cancelled", () => {
    const reservationService = TestBed.inject(ReservationService);
    const feedbackSpy = spyOn(reservationService, "getReservationFeedback").and.returnValue(of(null));

    (component as unknown as { loadFeedbackForReservations: (r: ReservationCustomer[]) => void })
      .loadFeedbackForReservations(mockReservations);

    // res-1 is Reserved, res-3 is Cancelled, res-2 is InProgress
    expect(feedbackSpy).toHaveBeenCalledTimes(1);
    expect(feedbackSpy).toHaveBeenCalledWith("res-2");
  });

  it("should open feedback modal without extra network request if feedback is already loaded", () => {
    const reservationService = TestBed.inject(ReservationService);
    const feedbackSpy = spyOn(reservationService, "getReservationFeedback").and.returnValue(of(null));

    const resWithFeedback: ReservationCustomer = {
      ...mockReservations[1],
      feedback: {
        reservationId: "res-2",
        service: { rating: 5, comment: "Great!" },
      } as unknown as FeedbackReservationResponseItem,
    };

    component.openFeedback(resWithFeedback);

    expect(component.showFeedbackModal()).toBeTrue();
    expect(component.selectedReservation()?.id).toBe("res-2");
    expect(feedbackSpy).not.toHaveBeenCalled();
  });
});
