import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LocationsService } from '@app/services/locations/locations.service';
import { ReviewSortLabels, ReviewTypeLabels } from '@app/shared/mappers/review-enum.mapper';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ReviewType } from '@app/models/enums/review-type.model';
import { ReviewSort } from '@app/models/enums/review-sort.model';
import { LocationResponse } from '@app/models/locations/location-response.model';
import { HeaderComponent } from '@app/shared/custom-components/header/header.component';
import { FeedbacksService } from '@app/services/feedbacks/feedbacks.service';
import { UsersService } from '@app/services/users/users.service';
import { ToastService } from '@app/services/toast/toast.service';
import { FeedbackResponseItem } from '@app/models/feedbacks/feedback-response-item.model';

@Component({
  selector: 'app-location-overview',
  imports: [CommonModule, HttpClientModule, HeaderComponent, RouterLink],
  templateUrl: './location-overview.component.html',
  styleUrl: './location-overview.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [LocationsService],
})
export class LocationOverviewComponent implements OnInit {
  readonly maxStars = 5;

  ReviewType = ReviewType;
  ReviewSort = ReviewSort;

  locationId!: string;
  location?: LocationResponse;
  reviews: FeedbackResponseItem[] = [];
  userImages: Record<string, string> = {};
  selectedType: ReviewType = ReviewType.Service;
  selectedSort: ReviewSort = ReviewSort.TopRatedFirst;

  currentPage = 1;
  totalPages = 1;

  reviewSortValues = Object.values(ReviewSort);
  reviewSortLabels = ReviewSortLabels;
  reviewsLabel = 'Reviews are loading... Please wait.';

  reviewTypeValues: ReviewType[] = [ReviewType.Service, ReviewType.CuisineExperience];
  reviewTypeLabels = ReviewTypeLabels;

  private readonly route = inject(ActivatedRoute);
  private readonly locationService = inject(LocationsService);
  private readonly feedbacksService = inject(FeedbacksService);
  private readonly usersService = inject(UsersService);
  private readonly toastService = inject(ToastService);

  ngOnInit(): void {
    this.locationId = this.route.snapshot.paramMap.get('id')!;

    this.loadLocationData();
    this.loadReviews();
  }

  loadLocationData(): void {
    this.locationService.getLocationById(this.locationId).subscribe({
      next: (data) => {
        this.location = data;
      },
      error: () => {
        this.toastService.error('Failed to load location details');
      },
    });
  }

  loadReviews(): void {
    this.reviews = [];
    this.reviewsLabel = 'Reviews are loading... Please wait.';
    this.feedbacksService
      .getLocationFeedbacks(this.locationId, this.selectedType, this.selectedSort, this.currentPage)
      .subscribe({
        next: (data) => {
          this.reviews = data.items.map((item) => ({
            ...item,
            username: this.getReviewerDisplayName(item.username),
          }));
          if (this.reviews.length === 0) {
            this.reviewsLabel = 'No reviews of this type found for this location.';
          }
          this.reviews.forEach((review) => {
            const key = review.userId || review.username || review.reservationId;
            if (!this.userImages[review.userId]) {
              this.userImages[review.userId] = this.getStockAvatar(review.username, key);
              if (review.userId) {
                this.usersService.getUserProfileImage(review.userId).subscribe({
                  next: (imageUrl) => {
                    if (imageUrl?.presignedUrl) {
                      this.userImages[review.userId] = imageUrl.presignedUrl;
                    }
                  },
                  error: () => {
                    this.userImages[review.userId] = this.getStockAvatar(review.username, key);
                  },
                });
              }
            }
          });
          this.totalPages = data.totalPages;
        },
        error: () => {
          this.reviewsLabel = 'Failed to load reviews.';
          this.toastService.error('Failed to load reviews');
        },
      });
  }

  onTabChange(type: ReviewType): void {
    this.selectedType = type;

    this.currentPage = 1;
    this.loadReviews();
  }

  onSortChange(target: EventTarget | null): void {
    if (target && target instanceof HTMLSelectElement) {
      const value = target.value;

      this.selectedSort = value as ReviewSort;

      this.currentPage = 1;
      this.loadReviews();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadReviews();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadReviews();
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.loadReviews();
  }

  getReviewerDisplayName(username?: string): string {
    const raw = (username || '').trim();
    const lower = raw.toLowerCase();
    const NAME_OVERRIDES: Record<string, string> = {
      'customer user': 'Mariam Lomidze',
      'customer': 'Mariam Lomidze',
      'user 1765': 'Giorgi Maisuradze',
      'anna': 'Anna Beridze',
      'elena': 'Elena Romanova',
      'alex': 'Alex Walker',
    };
    return NAME_OVERRIDES[lower] || raw || 'Mariam Lomidze';
  }

  getStockAvatar(username?: string, key?: string): string {
    const displayName = this.getReviewerDisplayName(username).toLowerCase().trim();
    const firstName = displayName.split(/\s+/)[0] || '';

    // Gender-verified avatar mapping:
    // Female avatars: avatar-3, avatar-5, avatar-6, avatar-8, avatar-10
    // Male avatars: avatar-1, avatar-2, avatar-4, avatar-7, avatar-9
    const KNOWN_MAP: Record<string, string> = {
      'anna': 'assets/img/avatars/avatar-3.jpg',
      'anna beridze': 'assets/img/avatars/avatar-3.jpg',
      'sophie': 'assets/img/avatars/avatar-5.jpg',
      'sophie miller': 'assets/img/avatars/avatar-5.jpg',
      'elena': 'assets/img/avatars/avatar-6.jpg',
      'elena romanova': 'assets/img/avatars/avatar-6.jpg',
      'tamar': 'assets/img/avatars/avatar-8.jpg',
      'tamar chkheidze': 'assets/img/avatars/avatar-8.jpg',
      'mariam': 'assets/img/avatars/avatar-10.jpg',
      'mariam lomidze': 'assets/img/avatars/avatar-10.jpg',
      'nino': 'assets/img/avatars/avatar-10.jpg',
      'nika': 'assets/img/avatars/avatar-1.jpg',
      'nika gaprindashvili': 'assets/img/avatars/avatar-1.jpg',
      'david': 'assets/img/avatars/avatar-2.jpg',
      'david kalandadze': 'assets/img/avatars/avatar-2.jpg',
      'giorgi': 'assets/img/avatars/avatar-4.jpg',
      'giorgi maisuradze': 'assets/img/avatars/avatar-4.jpg',
      'michael': 'assets/img/avatars/avatar-7.jpg',
      'michael brown': 'assets/img/avatars/avatar-7.jpg',
      'alex': 'assets/img/avatars/avatar-9.jpg',
      'alex walker': 'assets/img/avatars/avatar-9.jpg',
      'luka': 'assets/img/avatars/avatar-9.jpg',
    };

    if (KNOWN_MAP[displayName]) {
      return KNOWN_MAP[displayName];
    }
    if (KNOWN_MAP[firstName]) {
      return KNOWN_MAP[firstName];
    }

    const maleExceptions = new Set(['nika', 'luka', 'beka', 'giga', 'tsotne', 'erekle']);
    const isFemale =
      !maleExceptions.has(firstName) &&
      (firstName.endsWith('a') || firstName.endsWith('i') || firstName.endsWith('e'));

    const pool = isFemale ? [3, 5, 6, 8, 10] : [1, 2, 4, 7, 9];
    const seed = key || displayName || 'reviewer';
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
    }
    const avatarNum = pool[hash % pool.length];
    return `assets/img/avatars/avatar-${avatarNum}.jpg`;
  }

  getFeedbackUserImage(userId: string, username?: string): string {
    const existing = this.userImages[userId];
    if (existing && !existing.includes('avatar.png')) {
      return existing;
    }
    return this.getStockAvatar(username, userId);
  }

  get visiblePageNumbers(): number[] {
    const groupSize = 3;
    const startPage = Math.floor((this.currentPage - 1) / groupSize) * groupSize + 1;
    const endPage = Math.min(startPage + groupSize - 1, this.totalPages);

    const pages: number[] = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }
}
