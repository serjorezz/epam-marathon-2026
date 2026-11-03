import { Component, ChangeDetectionStrategy, input } from '@angular/core';

@Component({
  selector: 'app-skeleton-dish-card',
  standalone: true,
  template: `
    <div class="skeleton-dish-card" [style.max-width]="maxWidth() || null" role="status" aria-busy="true">
      <div class="skeleton-dish-circle skeleton-shimmer"></div>
      <div class="skeleton-dish-info">
        <div class="skeleton-dish-heading">
          <div class="skeleton-bar title-bar"></div>
          <div class="skeleton-bar price-bar"></div>
        </div>
        <div class="skeleton-bar weight-bar"></div>
        @if (preOrderEnabled()) {
          <div class="skeleton-box action-btn"></div>
        }
      </div>
    </div>
  `,
  styleUrls: ['./skeleton-dish-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonDishCardComponent {
  readonly maxWidth = input('');
  readonly preOrderEnabled = input(false);
}
