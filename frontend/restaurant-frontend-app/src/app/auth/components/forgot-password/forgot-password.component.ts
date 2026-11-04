import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CustomButtonComponent } from '@app/shared/custom-components/custom-button/custom-button.component';
import { TranslatePipe } from '@app/shared/pipes/translate.pipe';

@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule, RouterModule, CustomButtonComponent, TranslatePipe],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: true,
})
export class ForgotPasswordComponent {
  emailSent = false;

  private formBuilder = inject(FormBuilder);

  forgotPasswordForm: FormGroup = this.formBuilder.group({
    email: [
      '',
      [
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
      ],
    ],
  });

  get email() {
    return this.forgotPasswordForm.get('email');
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.valid) {
      this.emailSent = true;
    } else {
      this.forgotPasswordForm.markAllAsTouched();
    }
  }
}
