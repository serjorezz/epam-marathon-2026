import { Component, ChangeDetectionStrategy, computed, model, signal } from '@angular/core';

@Component({
  selector: 'app-rating',
  standalone: true,
  imports: [],
  templateUrl: './rating.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './rating.component.scss',
})
export class RatingComponent {
  readonly rating = model(3);
  readonly stars = Array(5).fill(0);

  /** Hovered star count — drives the preview while pointing over stars. */
  readonly hovered = signal(0);

  /** Rating to display: hover preview takes precedence over the set value. */
  readonly displayedRating = computed(() => this.hovered() || this.rating());

  setRating(value: number) {
    this.rating.set(value);
  }
}
