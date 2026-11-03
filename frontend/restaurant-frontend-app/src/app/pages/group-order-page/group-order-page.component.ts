import { TranslatePipe } from "@app/shared/pipes/translate.pipe";
import { CurrencyPipe, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { EMPTY, forkJoin, Subscription, timer } from 'rxjs';
import { catchError, exhaustMap, switchMap } from 'rxjs/operators';
import { ParticipantCardComponent } from '@app/components/group-orders/participant-card/participant-card.component';
import { GroupReservationStatus } from '@app/models/group-orders/group-status.model';
import { Participant } from '@app/models/group-orders/participant.model';
import { GuestInvite } from '@app/models/reservations/guest-invite.model';
import { GroupOrdersService } from '@app/services/group-orders/group-orders.service';
import { ToastService } from '@app/services/toast/toast.service';
import { ModalComponent } from '@app/shared/custom-components/modal/modal.component';
import { consolidatePreOrder } from '@app/shared/helpers/consolidate-pre-order';
import { SkeletonOrderItemComponent } from '@app/shared/custom-components/skeleton';

@Component({
  selector: 'app-group-order-page',
  imports: [CurrencyPipe, DatePipe, ParticipantCardComponent, ModalComponent, SkeletonOrderItemComponent, TranslatePipe],
  templateUrl: './group-order-page.component.html',
  styleUrl: './group-order-page.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class GroupOrderPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly groupOrdersService = inject(GroupOrdersService);
  private readonly toastService = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  readonly reservationId = this.route.snapshot.paramMap.get('reservationId') ?? '';

  readonly loading = signal(true);
  readonly error = signal<'notFound' | 'general' | null>(null);

  readonly invite = signal<GuestInvite | null>(null);
  readonly groupId = signal<string>('');
  readonly participants = signal<Participant[]>([]);
  readonly ownerSessionId = signal<string>('');
  readonly groupStatus = signal<GroupReservationStatus>('Open');

  readonly updatedAt = signal<Date>(new Date());
  readonly refreshError = signal(false);

  readonly submitting = signal(false);
  readonly showSubmitModal = signal(false);

  readonly guestToRemove = signal<Participant | null>(null);
  readonly removing = signal(false);

  private pollingSub: Subscription | null = null;

  readonly consolidated = computed(() => consolidatePreOrder(this.participants()));
  readonly grandTotal = computed(() => this.consolidated().total);
  readonly hasSubmittedDishes = computed(() => this.consolidated().items.length > 0);
  readonly hasAnyDishes = computed(() =>
    this.participants().some((person) => person.items && person.items.length > 0)
  );

  readonly unsubmittedCount = computed(
    () => this.participants().filter((person) => !person.isSubmitted).length
  );

  readonly unsubmittedWarning = computed(() => {
    const count = this.unsubmittedCount();
    if (count === 0) return null;
    const word = count === 1 ? "participant" : "participants";
    const verb = count === 1 ? "hasn't" : "haven't";
    return `${count} ${word} ${verb} submitted their cart yet — their dishes won't be included in the order`;
  });

  readonly isDeadlinePassed = computed(() => {
    if (this.reservationId === 'demo-reservation') {
      return false;
    }
    const invite = this.invite();
    if (!invite?.StartTime) return false;
    const startMs = new Date(invite.StartTime).getTime();
    if (isNaN(startMs)) return false;
    return Date.now() > startMs - 2 * 60 * 60 * 1000;
  });

  readonly statusBadge = computed(() => {
    if (this.groupStatus() === 'Submitted') {
      return 'Sent to Restaurant';
    }
    return 'Collecting pre-orders';
  });

  ngOnInit(): void {
    this.destroyRef.onDestroy(() => this.stopPolling());
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.error.set(null);

    this.groupOrdersService
      .getGroupInvite$(this.reservationId)
      .pipe(
        switchMap((invite) => {
          this.invite.set(invite);
          const gId = invite.GroupReservationId;
          this.groupId.set(gId);
          return forkJoin({
            sessions: this.groupOrdersService.getSessions$(gId),
            ownerSessionId: this.groupOrdersService.getOwnerSessionId$(this.reservationId),
            status: this.groupOrdersService.getStatus$(gId),
          });
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: ({ sessions, ownerSessionId, status }) => {
          this.participants.set(sessions.participants);
          this.ownerSessionId.set(ownerSessionId);
          this.groupStatus.set(status.status);
          this.updatedAt.set(new Date());
          this.refreshError.set(false);
          this.loading.set(false);

          if (status.status === 'Open') {
            this.startPolling(this.groupId());
          }
        },
        error: (err: HttpErrorResponse) => {
          this.loading.set(false);
          if (err.status === 404) {
            this.error.set('notFound');
          } else {
            this.error.set('general');
          }
        },
      });
  }

  private startPolling(gId: string): void {
    this.stopPolling();
    if (this.groupStatus() !== 'Open') {
      return;
    }

    this.pollingSub = timer(15000, 15000)
      .pipe(
        exhaustMap(() =>
          forkJoin({
            sessions: this.groupOrdersService.getSessions$(gId, { silent: true }),
            status: this.groupOrdersService.getStatus$(gId, { silent: true }),
          }).pipe(
            catchError(() => {
              this.refreshError.set(true);
              return EMPTY;
            })
          )
        )
      )
      .subscribe({
        next: ({ sessions, status }) => {
          this.participants.set(sessions.participants);
          this.groupStatus.set(status.status);
          this.updatedAt.set(new Date());
          this.refreshError.set(false);

          if (status.status !== 'Open') {
            this.stopPolling();
          }
        },
      });
  }

  private stopPolling(): void {
    if (this.pollingSub) {
      this.pollingSub.unsubscribe();
      this.pollingSub = null;
    }
  }

  refreshNow(): void {
    const gId = this.groupId();
    if (!gId) return;

    this.groupOrdersService
      .getSessions$(gId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (sessions) => {
          this.participants.set(sessions.participants);
          this.updatedAt.set(new Date());
          this.refreshError.set(false);
        },
        error: () => {
          this.refreshError.set(true);
        },
      });
  }

  openSubmitModal(): void {
    this.showSubmitModal.set(true);
  }

  closeSubmitModal(): void {
    this.showSubmitModal.set(false);
  }

  confirmSubmitOrder(): void {
    if (this.submitting()) {
      return;
    }

    this.submitting.set(true);
    this.groupOrdersService
      .submit$(this.groupId(), this.reservationId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.showSubmitModal.set(false);
          this.groupStatus.set('Submitted');
          this.stopPolling();
          this.toastService.success('Pre-order sent to the restaurant');
        },
        error: () => {
          this.submitting.set(false);
          this.showSubmitModal.set(false);
        },
      });
  }

  onRemoveGuest(person: Participant): void {
    this.guestToRemove.set(person);
  }

  cancelRemoveGuest(): void {
    this.guestToRemove.set(null);
  }

  confirmRemoveGuest(): void {
    const person = this.guestToRemove();
    if (!person || this.removing()) return;

    this.removing.set(true);
    this.groupOrdersService
      .removeSession$(this.groupId(), person.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.participants.set(response.participants);
          this.guestToRemove.set(null);
          this.removing.set(false);
        },
        error: () => {
          this.guestToRemove.set(null);
          this.removing.set(false);
        },
      });
  }
}
