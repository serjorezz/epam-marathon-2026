import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { TimeSlotsModalComponent } from './time-slots-modal.component';

describe('TimeSlotsModalComponent', () => {
  let component: TimeSlotsModalComponent;
  let fixture: ComponentFixture<TimeSlotsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimeSlotsModalComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(TimeSlotsModalComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('table', {
      id: 'table-1',
      tableNumber: 5,
      locationId: 'loc-1',
      capacity: 4,
      timeRanges: [
        { start: '2026-11-10T12:00:00Z', end: '2026-11-10T13:30:00Z' },
      ],
    });
    fixture.componentRef.setInput('locationName', 'Test Location');
    fixture.componentRef.setInput('date', '2026-11-10');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
