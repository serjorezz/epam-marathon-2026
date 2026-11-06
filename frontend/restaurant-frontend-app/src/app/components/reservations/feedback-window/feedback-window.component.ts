import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  inject,
  Input,
  OnInit,
  Output,
  ChangeDetectionStrategy,
  signal,
} from '@angular/core';
import { CustomButtonComponent } from '@app/shared/custom-components/custom-button/custom-button.component';
import { RatingComponent } from '@app/shared/custom-components/rating/rating.component';
import { Reservation, ReservationStatus } from '@app/models/reservations/reservation.model';
import { FeedbacksService } from '@app/services/feedbacks/feedbacks.service';
import { CreateFeedbackRequest } from '@app/models/feedbacks/create-feedback-request.model';
import { ReviewType } from '@app/models/enums/review-type.model';

import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { FeedbackReservationResponseItem } from '@app/models/feedbacks/feedback-reservation-response-item.model';
import { ToastService } from '@app/services/toast/toast.service';
import { AuthenticationService } from '@app/auth/services/authentication.service';
import { UsersService } from '@app/services/users/users.service';
import { FeedbackUpdatedEvent } from '@app/models/feedbacks/feedback.model';
import { TranslatePipe } from '@app/shared/pipes/translate.pipe';

@Component({
    selector: 'app-feedback-window',
    imports: [CustomButtonComponent, RatingComponent, FormsModule, TranslatePipe],
    templateUrl: './feedback-window.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './feedback-window.component.scss',
    standalone: true
})
export class FeedbackWindowComponent implements OnInit, AfterViewInit {
  @Input() customClass = '';
  @Input() selectedReservation!: Reservation;
  @Input() feedbackForUpdate: FeedbackReservationResponseItem | undefined;
  @Input() anonymousToken = '';
  @Output() closedFeedback = new EventEmitter<void>();

  @Output() feedbackUpdated = new EventEmitter<FeedbackUpdatedEvent>();

  @HostBinding('class.fade-out') isFading = false;

  hovered: 'left' | 'right' | '' = '';
  selectedTab: 'service' | 'cuisine' = 'service';

  elRef = inject(ElementRef);

  serviceRating = 0;
  cuisineRating = 0;

  serviceComment = '';
  cuisineComment = '';
  // for anonymous
  showCuisineForm = true;
  showServiceForm = true;
  isAnonymous = false;

  waiterName = signal('Mario Jast');
  waiterProfileImage = signal('/assets/img/avatar-mario.jpg');

  /** Guards against applying late responses for a different waiter/reservation. */
  private loadedWaiterId: string | null = null;

  /** Local waiter photos used when the backend has no uploaded profile image. */
  private readonly fallbackAvatars = Array.from(
    { length: 10 },
    (_, i) => `/assets/img/avatars/avatar-${i + 1}.jpg`,
  );

  feedbacksService = inject(FeedbacksService);
  toastr = inject(ToastService);
  authService = inject(AuthenticationService);
  userService = inject(UsersService);

  ngOnInit(): void {
    console.log(this.feedbackForUpdate);

    const isAnon =
      this.selectedReservation?.customerId === null || this.selectedReservation?.customerId === '';
    this.isAnonymous = isAnon;

    if (this.feedbackForUpdate) {
      if (this.feedbackForUpdate.service) {
        this.serviceRating = this.feedbackForUpdate.service.rating;
        this.serviceComment = this.feedbackForUpdate.service.comment;

        if (isAnon) {
          this.showServiceForm = false;
          console.log('Service feedback already exists for anonymous → hiding service form');
        } else {
          console.log(
            'Service feedback exists for logged-in user → keeping form visible for updates'
          );
        }
      }

      if (this.feedbackForUpdate.cuisineExperience) {
        this.cuisineRating = this.feedbackForUpdate.cuisineExperience.rating;
        this.cuisineComment = this.feedbackForUpdate.cuisineExperience.comment;

        if (isAnon) {
          this.showCuisineForm = false;
          console.log('Cuisine feedback already exists for anonymous → hiding cuisine form');
        } else {
          console.log(
            'Cuisine feedback exists for logged-in user → keeping form visible for updates'
          );
        }
      }

      if (isAnon && this.feedbackForUpdate.service && this.feedbackForUpdate.cuisineExperience) {
        this.showServiceForm = false;
        this.showCuisineForm = false;
        this.closedFeedback.emit();
        return;
      }
    }

    if (this.isAnonymous) {
      if (!this.showServiceForm && this.showCuisineForm) {
        this.selectedTab = 'cuisine';
      } else if (!this.showCuisineForm && this.showServiceForm) {
        this.selectedTab = 'service';
      }
    }

    if (this.selectedReservation && this.selectedReservation.waiterId) {
      const waiterId = this.selectedReservation.waiterId;
      this.loadedWaiterId = waiterId;
      const fallback = this.fallbackAvatarFor(waiterId);

      this.authService.getUserNameById$(waiterId).subscribe({
        next: (name) => {
          if (this.loadedWaiterId === waiterId) {
            this.waiterName.set(name);
          }
        },
        error: (err) => {
          console.error('Error fetching waiter name:', err);
          this.toastr.error('Failed to load waiter information.');
        },
      });
      this.userService.getUserProfileImage(waiterId).subscribe({
        next: (response) => {
          if (this.loadedWaiterId === waiterId) {
            this.waiterProfileImage.set(response.presignedUrl ?? fallback);
          }
        },
        error: (err) => {
          console.error('Error fetching waiter profile image:', err);
          if (this.loadedWaiterId === waiterId) {
            this.waiterProfileImage.set(fallback);
          }
        },
      });
    }
  }

  /** Stable per-waiter fallback photo so every waiter shows a real avatar. */
  private fallbackAvatarFor(waiterId: string): string {
    let hash = 0;
    for (let i = 0; i < waiterId.length; i++) {
      hash = (hash * 31 + waiterId.charCodeAt(i)) | 0;
    }
    const index = Math.abs(hash) % this.fallbackAvatars.length;
    return this.fallbackAvatars[index];
  }

  /** Swap to a local fallback photo if the loaded image cannot be displayed. */
  onAvatarError(): void {
    const waiterId = this.selectedReservation?.waiterId;
    const fallback = waiterId
      ? this.fallbackAvatarFor(waiterId)
      : '/assets/img/avatar-mario.jpg';
    if (this.waiterProfileImage() !== fallback) {
      this.waiterProfileImage.set(fallback);
    }
  }

  ngAfterViewInit(): void {
    const wrapper = this.elRef.nativeElement.querySelector('.feedback-wrapper');
    if (wrapper) {
      wrapper.addEventListener('click', (event: Event) => event.stopPropagation());
    }
  }

  onClose(): void {
    this.closedFeedback.emit();
    this.isFading = true;
  }

  onSubmitFeedback(): void {
    const requests: CreateFeedbackRequest[] = [];
    const serviceAlreadyExists = this.feedbackForUpdate?.service != null;
    const cuisineAlreadyExists = this.feedbackForUpdate?.cuisineExperience != null;

    if (this.serviceRating > 0 && !serviceAlreadyExists) {
      requests.push({
        reservationId: this.selectedReservation.id,
        userId: this.selectedReservation.customerId,
        rating: this.serviceRating,
        comment: this.serviceComment?.trim() || undefined,
        type: ReviewType.Service,
      });
    }

    if (this.cuisineRating > 0 && !cuisineAlreadyExists) {
      requests.push({
        reservationId: this.selectedReservation.id,
        userId: this.selectedReservation.customerId,
        rating: this.cuisineRating,
        comment: this.cuisineComment?.trim() || undefined,
        type: ReviewType.CuisineExperience,
      });
    }

    const requests$ = requests.map((req) =>
      this.feedbacksService.leaveFeedback(req, this.anonymousToken)
    );

    // Send both requests in parallel
    forkJoin(requests$).subscribe({
      next: () => {
        if (this.selectedReservation) {
          this.selectedReservation.status = ReservationStatus.Finished;
          console.log(' this.selectedReservation.status ', this.selectedReservation.status);
        }
        this.feedbackUpdated.emit({
          reservationId: this.selectedReservation.id,
          feedback: {
            service:
              this.serviceRating > 0
                ? { rating: this.serviceRating, comment: this.serviceComment }
                : null,
            cuisineExperience:
              this.cuisineRating > 0
                ? { rating: this.cuisineRating, comment: this.cuisineComment }
                : null,
          },
        });
        this.closedFeedback.emit();
      },
      error: (err) => {
        console.error('Error submitting feedback:', err);
      },
    });
  }

  onUpdateFeedback(): void {
    const requests: CreateFeedbackRequest[] = [];
    const originalService = this.feedbackForUpdate?.service;
    const originalCuisine = this.feedbackForUpdate?.cuisineExperience;

    const serviceChanged =
      this.serviceRating > 0 &&
      (originalService?.rating !== this.serviceRating ||
        originalService?.comment !== this.serviceComment);

    const cuisineChanged =
      this.cuisineRating > 0 &&
      (originalCuisine?.rating !== this.cuisineRating ||
        originalCuisine?.comment !== this.cuisineComment);

    if (serviceChanged) {
      requests.push({
        reservationId: this.selectedReservation.id,
        userId: this.selectedReservation.customerId,
        rating: this.serviceRating,
        comment: this.serviceComment?.trim() || undefined,
        type: ReviewType.Service,
      });
    }

    if (cuisineChanged) {
      requests.push({
        reservationId: this.selectedReservation.id,
        userId: this.selectedReservation.customerId,
        rating: this.cuisineRating,
        comment: this.cuisineComment?.trim() || undefined,
        type: ReviewType.CuisineExperience,
      });
    }
    if (requests.length === 0) {
      this.toastr.info('No changes to update.');
      return;
    }
    const requests$ = requests.map((req) => this.feedbacksService.updateFeedback(req));

    // Send both requests in parallel
    forkJoin(requests$).subscribe({
      next: () => {
        this.feedbackUpdated.emit({
          reservationId: this.selectedReservation.id,
          feedback: {
            service:
              this.serviceRating > 0
                ? { rating: this.serviceRating, comment: this.serviceComment }
                : null,
            cuisineExperience:
              this.cuisineRating > 0
                ? { rating: this.cuisineRating, comment: this.cuisineComment }
                : null,
          },
        });
        this.closedFeedback.emit();
      },
      error: (err) => {
        console.error('Error updating feedback:', err);
      },
    });
  }

  getFirstName(fullName?: string): string {
    if (!fullName || fullName === 'Anonymous User') {
      return 'Unknown';
    }
    return fullName.split(' ')[0] || 'Unknown';
  }
}
