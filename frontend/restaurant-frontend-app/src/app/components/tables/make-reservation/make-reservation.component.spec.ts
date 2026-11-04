import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MakeReservationComponent } from './make-reservation.component';
import { Table } from '@app/models/tables/table.model';

describe('MakeReservationComponent', () => {
  let component: MakeReservationComponent;
  let fixture: ComponentFixture<MakeReservationComponent>;

  const table: Table = {
    id: 'table-1',
    tableNumber: 11,
    locationId: 'location-1',
    capacity: 4,
    timeRanges: [
      { start: '2026-11-05T14:00:00Z', end: '2026-11-05T15:30:00Z' },
    ],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MakeReservationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MakeReservationComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('table', table);
    fixture.componentRef.setInput('locationName', 'Test Location');
    fixture.componentRef.setInput('selectedTimeRange', table.timeRanges[0]);
    fixture.componentRef.setInput('guests', 2);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
