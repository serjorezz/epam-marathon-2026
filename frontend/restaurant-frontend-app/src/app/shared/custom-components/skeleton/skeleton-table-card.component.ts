import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-skeleton-table-card',
  standalone: true,
  template: `
    <div class="skeleton-table-card" role="status" aria-busy="true">
      <div class="skeleton-table-image skeleton-shimmer"></div>
      <div class="skeleton-table-content">
        <div class="skeleton-table-header">
          <div class="skeleton-bar title-bar"></div>
          <div class="skeleton-bar capacity-bar"></div>
        </div>
        <div class="skeleton-bar location-bar"></div>
        <div class="skeleton-table-slots">
          @for (_ of [1, 2, 3, 4, 5, 6]; track $index) {
            <div class="skeleton-box slot-box"></div>
          }
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./skeleton-table-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonTableCardComponent {}
