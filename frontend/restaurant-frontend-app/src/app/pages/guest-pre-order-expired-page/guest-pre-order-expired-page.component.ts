import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslatePipe } from '@app/shared/pipes/translate.pipe';

@Component({
    standalone: true,
    selector: 'app-guest-pre-order-expired-page',
    templateUrl: './guest-pre-order-expired-page.component.html',
    styleUrl: './guest-pre-order-expired-page.component.scss',
    imports: [TranslatePipe],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GuestPreOrderExpiredPageComponent {}
