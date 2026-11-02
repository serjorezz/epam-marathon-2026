import { CustomButtonComponent } from '@app/shared/custom-components/custom-button/custom-button.component';
import {
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { HeaderComponent } from '@app/shared/custom-components/header/header.component';
import { AuthenticationService } from '@app/auth/services/authentication.service';
import { CustomSelectComponent } from '@app/shared/custom-components/custom-select/custom-select.component';

import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import dayjs from 'dayjs';
import { LocationResponse } from '@app/models/locations/location-response.model';
import { LocationsService } from '@app/services/locations/locations.service';
import { ReportsService } from '@app/services/reports/reports.service';
import { CommonModule } from '@angular/common';
import { ReportRow } from '@app/models/reports/reporsts.model';

@Component({
  selector: 'app-reporting-dashboard',
  imports: [
    HeaderComponent,
    CustomSelectComponent,
    ReactiveFormsModule,
    FormsModule,
    CustomButtonComponent,
    CommonModule,
  ],
  templateUrl: './reporting-dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './reporting-dashboard.component.scss',
})
export class ReportingDashboardComponent implements OnInit {
  firstName: string | null = 'Admin';
  lastName: string | null = 'User';
  role: string | null = 'Admin';
  customerId: string | null = null;

  selectedReportType = 'Staff performance';
  reportTypes: string[] = ['Staff performance', 'Sales'];

  calendarVisible = false;
  currentMonth = dayjs();
  selected: { startDate: dayjs.Dayjs; endDate: dayjs.Dayjs } = {
    startDate: dayjs().subtract(30, 'day'),
    endDate: dayjs(),
  };

  authenticationService = inject(AuthenticationService);
  locationsService = inject(LocationsService);
  reportsService = inject(ReportsService);

  locations: LocationResponse[] = [
    {
      id: 'loc-1',
      address: 'Rustaveli Avenue 48',
      description: 'Central Tbilisi branch',
      totalCapacity: 80,
      averageOccupancy: '75%',
      imageUrl: 'assets/img/locations/rustaveli-avenue-48.jpg',
      rating: 4.8,
    },
    {
      id: 'loc-2',
      address: 'Chavchavadze Avenue 24',
      description: 'Vake district branch',
      totalCapacity: 60,
      averageOccupancy: '70%',
      imageUrl: 'assets/img/locations/chavchavadze-avenue-24.jpg',
      rating: 4.7,
    },
    {
      id: 'loc-3',
      address: 'Marjanishvili Street 7',
      description: 'Historic district branch',
      totalCapacity: 50,
      averageOccupancy: '65%',
      imageUrl: 'assets/img/locations/marjanishvili-street-7.jpg',
      rating: 4.6,
    },
    {
      id: 'loc-4',
      address: 'Baratashvili Street 14',
      description: 'Old Tbilisi branch',
      totalCapacity: 45,
      averageOccupancy: '80%',
      imageUrl: 'assets/img/locations/baratashvili-street-14.jpg',
      rating: 4.9,
    },
  ];

  selectedLocationId = 'loc-1';
  selectedLocationAddress = 'Rustaveli Avenue 48';
  weekDays: string[] = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  reportData: ReportRow[] = [];
  downloadOptions = ['Download in PDF', 'Download in Excel', 'Download in CSV'];

  isLoading = false;
  isSampleData = false;

  private cdr = inject(ChangeDetectorRef);

  constructor() {
    this.loadSampleData();
  }

  async ngOnInit(): Promise<void> {
    try {
      const user = this.authenticationService.getUser();
      if (user) {
        this.firstName = user.firstName || this.firstName;
        this.lastName = user.lastName || this.lastName;
        this.role = user.role || this.role;
        this.customerId = user.id;
      }
    } catch (error) {
      console.warn('Error loading user profile from auth service:', error);
    }

    this.locationsService.getLocations().subscribe({
      next: (locations) => {
        if (locations && locations.length > 0) {
          this.locations = locations;
          if (!this.selectedLocationId || this.selectedLocationId === 'loc-1') {
            this.selectedLocationId = locations[0].id;
            this.selectedLocationAddress = locations[0].address;
          }
        }
        this.genetateReportRequest();
      },
      error: (err) => {
        console.warn('Failed to load locations, using default locations list:', err);
        this.genetateReportRequest();
      },
    });
  }

  get locationAddresses(): string[] {
    return this.locations.map((loc) => loc.address);
  }

  get totalOrdersCount(): number {
    return this.reportData.reduce(
      (acc, row) => acc + (row.totalOrders || row.ordersProcessed || 0),
      0
    );
  }

  get totalWorkingHours(): number {
    return this.reportData.reduce((acc, row) => acc + (row.workingHours || 0), 0);
  }

  get averageServiceRating(): number {
    if (!this.reportData.length) return 0;
    const sum = this.reportData.reduce((acc, row) => acc + (row.avgServiceFeedback || 0), 0);
    return sum / this.reportData.length;
  }

  get totalRevenue(): number {
    return this.reportData.reduce((acc, row) => acc + (row.revenue || 0), 0);
  }

  get totalRevenueDelta(): number {
    return this.reportData.reduce((acc, row) => acc + (row.deltaRevenue || 0), 0);
  }

  get averageCuisineRating(): number {
    if (!this.reportData.length) return 0;
    const sum = this.reportData.reduce((acc, row) => acc + (row.avgCuisineFeedback || 0), 0);
    return sum / this.reportData.length;
  }

  get activeStaffCount(): number {
    return this.reportData.length;
  }

  getPeriodPlaceholder(): string {
    if (this.selected?.startDate?.isValid() && this.selected?.endDate?.isValid()) {
      return `${this.selected.startDate.format('MMM D, YYYY')} – ${this.selected.endDate.format('MMM D, YYYY')}`;
    }
    return 'Select period';
  }

  onReportTypeSelected(option: string): void {
    this.selectedReportType = option;
    this.genetateReportRequest();
  }

  onLocationSelected(address: string): void {
    const selected = this.locations.find((loc) => loc.address === address);
    if (selected) {
      this.selectedLocationId = selected.id;
      this.selectedLocationAddress = selected.address;
      this.genetateReportRequest();
    }
  }

  genetateReportRequest(): void {
    if (!this.selectedReportType || !this.selectedLocationId || !this.selected?.startDate || !this.selected?.endDate) {
      this.loadSampleData();
      return;
    }

    const type = this.selectedReportType === 'Staff performance' ? 0 : 1;
    const startDate = this.selected.startDate.format('YYYY-MM-DD');
    const endDate = this.selected.endDate.format('YYYY-MM-DD');
    const locationId = this.selectedLocationId;

    this.isLoading = true;

    this.reportsService.getReportData(type, startDate, endDate, locationId).subscribe({
      next: (data) => {
        this.isLoading = false;
        if (Array.isArray(data) && data.length > 0) {
          this.reportData = data;
          this.isSampleData = false;
        } else {
          this.loadSampleData();
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.loadSampleData();
        this.cdr.detectChanges();
      },
    });
  }

  loadSampleData(): void {
    this.isSampleData = true;
    const startStr = this.selected?.startDate?.format('YYYY-MM-DD') || dayjs().subtract(30, 'day').format('YYYY-MM-DD');
    const endStr = this.selected?.endDate?.format('YYYY-MM-DD') || dayjs().format('YYYY-MM-DD');
    const locName = this.selectedLocationAddress || 'Rustaveli Avenue 48';
    const locId = this.selectedLocationId || 'loc-1';

    if (this.selectedReportType === 'Staff performance') {
      this.reportData = [
        {
          locationName: locName,
          locationId: locId,
          waiterName: 'Nino Beridze',
          waiterEmail: 'nino.beridze@green-tasty.ge',
          waiterId: 'waiter-1',
          startDate: startStr,
          endDate: endStr,
          workingHours: 48,
          totalOrders: 94,
          ordersProcessed: 94,
          deltaTotalOrders: 12,
          ordersDelta: '+12%',
          avgServiceFeedback: 4.9,
          deltaAvgServiceFeedback: 0.2,
          minServiceFeedback: 4.2,
        },
        {
          locationName: locName,
          locationId: locId,
          waiterName: 'Giorgi Kalandadze',
          waiterEmail: 'giorgi.k@green-tasty.ge',
          waiterId: 'waiter-2',
          startDate: startStr,
          endDate: endStr,
          workingHours: 44,
          totalOrders: 86,
          ordersProcessed: 86,
          deltaTotalOrders: 8,
          ordersDelta: '+9%',
          avgServiceFeedback: 4.8,
          deltaAvgServiceFeedback: 0.1,
          minServiceFeedback: 4.0,
        },
        {
          locationName: locName,
          locationId: locId,
          waiterName: 'Tamar Chikovani',
          waiterEmail: 'tamar.c@green-tasty.ge',
          waiterId: 'waiter-3',
          startDate: startStr,
          endDate: endStr,
          workingHours: 52,
          totalOrders: 108,
          ordersProcessed: 108,
          deltaTotalOrders: 15,
          ordersDelta: '+16%',
          avgServiceFeedback: 4.7,
          deltaAvgServiceFeedback: 0.3,
          minServiceFeedback: 3.9,
        },
        {
          locationName: locName,
          locationId: locId,
          waiterName: 'Anna Kapanadze',
          waiterEmail: 'anna.k@green-tasty.ge',
          waiterId: 'waiter-4',
          startDate: startStr,
          endDate: endStr,
          workingHours: 42,
          totalOrders: 82,
          ordersProcessed: 82,
          deltaTotalOrders: 6,
          ordersDelta: '+7%',
          avgServiceFeedback: 4.85,
          deltaAvgServiceFeedback: 0.15,
          minServiceFeedback: 4.1,
        },
        {
          locationName: locName,
          locationId: locId,
          waiterName: 'Davit Mgeladze',
          waiterEmail: 'davit.m@green-tasty.ge',
          waiterId: 'waiter-5',
          startDate: startStr,
          endDate: endStr,
          workingHours: 36,
          totalOrders: 64,
          ordersProcessed: 64,
          deltaTotalOrders: -4,
          ordersDelta: '-5%',
          avgServiceFeedback: 4.6,
          deltaAvgServiceFeedback: -0.1,
          minServiceFeedback: 3.6,
        },
      ];
    } else {
      this.reportData = [
        {
          locationName: 'Rustaveli Avenue 48',
          locationId: 'loc-1',
          waiterName: '',
          waiterEmail: '',
          startDate: startStr,
          endDate: endStr,
          workingHours: 196,
          totalOrders: 384,
          ordersProcessed: 384,
          deltaTotalOrders: 32,
          ordersDelta: '+9.1%',
          revenue: 15420.0,
          avgServiceFeedback: 4.8,
          avgCuisineFeedback: 4.8,
          minCuisineFeedback: 4.2,
          deltaAvgCuisineFeedback: 0.2,
          deltaRevenue: 1850.0,
        },
        {
          locationName: 'Chavchavadze Avenue 24',
          locationId: 'loc-2',
          waiterName: '',
          waiterEmail: '',
          startDate: startStr,
          endDate: endStr,
          workingHours: 180,
          totalOrders: 320,
          ordersProcessed: 320,
          deltaTotalOrders: 24,
          ordersDelta: '+8.1%',
          revenue: 13180.0,
          avgServiceFeedback: 4.7,
          avgCuisineFeedback: 4.7,
          minCuisineFeedback: 4.0,
          deltaAvgCuisineFeedback: 0.1,
          deltaRevenue: 1240.0,
        },
        {
          locationName: 'Marjanishvili Street 7',
          locationId: 'loc-3',
          waiterName: '',
          waiterEmail: '',
          startDate: startStr,
          endDate: endStr,
          workingHours: 140,
          totalOrders: 215,
          ordersProcessed: 215,
          deltaTotalOrders: -8,
          ordersDelta: '-3.6%',
          revenue: 8940.0,
          avgServiceFeedback: 4.6,
          avgCuisineFeedback: 4.6,
          minCuisineFeedback: 3.8,
          deltaAvgCuisineFeedback: -0.1,
          deltaRevenue: -340.0,
        },
        {
          locationName: 'Baratashvili Street 14',
          locationId: 'loc-4',
          waiterName: '',
          waiterEmail: '',
          startDate: startStr,
          endDate: endStr,
          workingHours: 160,
          totalOrders: 260,
          ordersProcessed: 260,
          deltaTotalOrders: 18,
          ordersDelta: '+7.4%',
          revenue: 10450.0,
          avgServiceFeedback: 4.9,
          avgCuisineFeedback: 4.9,
          minCuisineFeedback: 4.5,
          deltaAvgCuisineFeedback: 0.3,
          deltaRevenue: 1420.0,
        },
      ];
    }
  }

  onDownloadOptionSelected(option: string): void {
    if (option === 'Download in CSV') {
      this.downloadClientCsv();
      return;
    }

    const type = this.selectedReportType === 'Staff performance' ? 0 : 1;
    const startDate = this.selected.startDate.format('YYYY-MM-DD');
    const endDate = this.selected.endDate.format('YYYY-MM-DD');
    const locationId = this.selectedLocationId;

    if (option === 'Download in PDF') {
      this.reportsService.downloadReportPdf(type, startDate, endDate, locationId);
    } else if (option === 'Download in Excel') {
      this.reportsService.downloadReportExcel(type, startDate, endDate, locationId);
    }
  }

  downloadClientCsv(): void {
    if (!this.reportData || this.reportData.length === 0) return;

    const isStaff = this.selectedReportType === 'Staff performance';
    let csv = '';

    if (isStaff) {
      csv = 'Location,Waiter,Email,Start Date,End Date,Working Hours,Orders Processed,Orders Delta,Average Service Feedback\r\n';
      for (const row of this.reportData) {
        csv += `"${row.locationName}","${row.waiterName}","${row.waiterEmail}","${row.startDate}","${row.endDate}",${row.workingHours},${row.totalOrders},"${row.deltaTotalOrders}",${row.avgServiceFeedback}\r\n`;
      }
    } else {
      csv = 'Location,Start Date,End Date,Orders Processed,Revenue,Avg Cuisine Feedback,Min Cuisine Feedback,Delta Avg Feedback,Delta Revenue\r\n';
      for (const row of this.reportData) {
        csv += `"${row.locationName}","${row.startDate}","${row.endDate}",${row.totalOrders},${row.revenue},${row.avgCuisineFeedback},${row.minCuisineFeedback},${row.deltaAvgCuisineFeedback},${row.deltaRevenue}\r\n`;
      }
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `report_${this.selectedReportType === 'Staff performance' ? 'staff' : 'sales'}_${dayjs().format('YYYYMMDD')}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  toggleCalendar(): void {
    this.calendarVisible = !this.calendarVisible;
    this.cdr.detectChanges();
  }

  selectPreset(days: number): void {
    this.selected = {
      startDate: dayjs().subtract(days, 'day'),
      endDate: dayjs(),
    };
    this.calendarVisible = false;
    this.genetateReportRequest();
  }

  selectThisMonth(): void {
    this.selected = {
      startDate: dayjs().startOf('month'),
      endDate: dayjs(),
    };
    this.calendarVisible = false;
    this.genetateReportRequest();
  }

  onDayClicked(date: Date): void {
    const clickedDay = dayjs(date);

    if (!this.selected || (this.selected.startDate && this.selected.endDate)) {
      this.selected = { startDate: clickedDay, endDate: clickedDay };
    } else if (clickedDay.isBefore(this.selected.startDate, 'day')) {
      this.selected = { startDate: clickedDay, endDate: this.selected.startDate };
      this.calendarVisible = false;
      this.genetateReportRequest();
    } else {
      this.selected.endDate = clickedDay;
      this.calendarVisible = false;
      this.genetateReportRequest();
    }

    this.cdr.detectChanges();
  }

  isSelected(date: Date): boolean {
    const day = dayjs(date);
    if (!this.selected) return false;

    const { startDate, endDate } = this.selected;
    const isStart = day.isSame(startDate, 'day');
    const isEnd = endDate !== null && day.isSame(endDate, 'day');

    return isStart || isEnd;
  }

  isInRange(date: Date): boolean {
    const day = dayjs(date);
    if (!this.selected?.startDate || !this.selected?.endDate) return false;

    return day.isAfter(this.selected.startDate, 'day') && day.isBefore(this.selected.endDate, 'day');
  }

  isInvalidDate(date: Date): boolean {
    return Number.isNaN(date.getTime());
  }

  getDaysInMonth(): Date[] {
    const year = this.currentMonth.year();
    const month = this.currentMonth.month();
    const days: Date[] = [];

    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const leadingEmpty = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    for (let i = 0; i < leadingEmpty; i++) {
      days.push(new Date(NaN));
    }

    const total = new Date(year, month + 1, 0).getDate();
    for (let d = 1; d <= total; d++) {
      days.push(new Date(year, month, d));
    }

    return days;
  }

  previousMonth(): void {
    this.currentMonth = this.currentMonth.subtract(1, 'month');
  }

  nextMonth(): void {
    this.currentMonth = this.currentMonth.add(1, 'month');
  }

  getInitials(name: string): string {
    if (!name) return 'WT';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  isPositive(val?: number): boolean {
    return typeof val === 'number' && val > 0;
  }

  isNegative(val?: number): boolean {
    return typeof val === 'number' && val < 0;
  }
}
