import { Component, ChangeDetectionStrategy, input } from '@angular/core';

@Component({
  selector: 'app-skeleton-location-card',
  standalone: true,
  template: `
    <div class="skeleton-location-card" [style.max-width]="maxWidth() || null" role="status" aria-busy="true">
      <div class="skeleton-location-image skeleton-shimmer"></div>
      <div class="skeleton-location-text">
        <div class="skeleton-bar address-bar"></div>
        <div class="skeleton-divider"></div>
        <div class="skeleton-location-footer">
          <div class="skeleton-bar capacity-bar"></div>
          <div class="skeleton-bar occupancy-bar"></div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./skeleton-location-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonLocationCardComponent {
  readonly maxWidth = input('');
}
