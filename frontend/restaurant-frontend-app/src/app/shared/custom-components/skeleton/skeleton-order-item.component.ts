import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { TranslatePipe } from '@app/shared/pipes/translate.pipe';

@Component({
  selector: 'app-skeleton-order-item',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    <div class="skeleton-order-container" role="status" aria-busy="true" aria-label="Loading orders">
      @for (_ of items(); track $index) {
        <div class="skeleton-order-card">
          <div class="skeleton-thumb skeleton-shimmer"></div>
          <div class="skeleton-middle">
            <div class="skeleton-bar title-bar"></div>
            <div class="skeleton-box desc-box"></div>
            <div class="skeleton-bar detail-line-1"></div>
            <div class="skeleton-bar detail-line-2"></div>
          </div>
          <div class="skeleton-right">
            <span class="qty-price-label">{{ 'Qty. & Price' | translate }}</span>
            <div class="skeleton-bar price-line-1"></div>
            <div class="skeleton-bar price-line-2"></div>
          </div>
        </div>
      }
    </div>
  `,
  styleUrls: ['./skeleton-order-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonOrderItemComponent {
  readonly count = input(2);
  readonly items = computed(() => Array.from({ length: Math.max(1, this.count()) }));
}
