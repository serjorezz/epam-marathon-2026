import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReservationDashboardComponent } from "./reservation-dashboard.component";
import { API_BASE_URL } from "@app/shared/config/api-base-url.token";
import { provideRouter } from "@angular/router";
import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { ReservationCustomer, ReservationStatusCustomer } from "@app/models/reservations/reservation.model";

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
      status: ReservationStatusCustomer.Reserved,
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
      status: ReservationStatusCustomer.Reserved,
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
});
