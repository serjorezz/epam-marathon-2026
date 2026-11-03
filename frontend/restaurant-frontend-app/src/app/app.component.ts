import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChatWidgetComponent } from './shared/custom-components/chat-widget/chat-widget.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ChatWidgetComponent],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'restaurant-frontend-app';
}
