import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-skeleton-reservation-card',
  standalone: true,
  template: `
    <li class="skeleton-reservation-card" role="status" aria-busy="true">
      <div class="skeleton-res-header"></div>
      <div class="skeleton-res-body">
        <div class="skeleton-bar loc-bar"></div>
        <div class="details-grid-skel">
          <div class="skeleton-bar date-bar"></div>
          <div class="skeleton-bar preorder-bar"></div>
          <div class="skeleton-bar time-bar"></div>
          <div class="skeleton-bar guests-bar"></div>
        </div>
      </div>
      <div class="skeleton-res-footer">
        <div class="skeleton-box btn-box"></div>
      </div>
    </li>
  `,
  styleUrls: ['./skeleton-reservation-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonReservationCardComponent {}
