import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { PasswordComponent } from '../password/password.component';
import { NgClass } from '@angular/common';
import { TranslatePipe } from '@app/shared/pipes/translate.pipe';

@Component({
  selector: 'app-confirm-password',
  imports: [PasswordComponent, NgClass, TranslatePipe],
  templateUrl: './confirm-password.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './confirm-password.component.scss',
})
export class ConfirmPasswordComponent {
  readonly control = input.required<FormControl>();
}
