import {
  Component,
  ChangeDetectionStrategy,
  signal,
  inject,
  ElementRef,
  ViewChild,
  AfterViewChecked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ChatService } from '@app/services/chat/chat.service';
import { ChatMessage } from '@app/models/chat/chat.model';

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-widget.component.html',
  styleUrl: './chat-widget.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatWidgetComponent implements AfterViewChecked {
  private readonly chatService = inject(ChatService);
  private readonly router = inject(Router);

  @ViewChild('messagesContainer') private messagesContainer?: ElementRef<HTMLDivElement>;

  readonly isOpen = signal<boolean>(false);
  readonly isLoading = signal<boolean>(false);
  readonly inputMessage = signal<string>('');

  readonly messages = signal<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: 'Hello! 👋 Welcome to Green & Tasty. I am your AI dining host powered by Gemini. I can check table availability and reserve a table for you through this chat. How may I help you today?',
      timestamp: new Date(),
    },
  ]);

  private shouldScroll = false;

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  toggleChat(): void {
    const nextState = !this.isOpen();
    this.isOpen.set(nextState);
    if (nextState) {
      this.shouldScroll = true;
    }
  }

  closeChat(): void {
    this.isOpen.set(false);
  }

  sendMessage(): void {
    const text = this.inputMessage().trim();
    if (!text || this.isLoading()) {
      return;
    }

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date(),
    };

    // Append user message
    this.messages.update((list) => [...list, userMessage]);
    this.inputMessage.set('');
    this.isLoading.set(true);
    this.shouldScroll = true;

    // Prepare history for Gemini
    const history = this.messages()
      .filter((m) => m.id !== userMessage.id && m.id !== 'msg-welcome')
      .map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: m.text,
      }));

    this.chatService.sendMessage$({ message: text, history }).subscribe({
      next: (response) => {
        const assistantMessage: ChatMessage = {
          id: `ast-${Date.now()}`,
          sender: 'assistant',
          text: response.reply,
          timestamp: new Date(),
          reservation: response.reservation,
        };

        this.messages.update((list) => [...list, assistantMessage]);
        this.isLoading.set(false);
        this.shouldScroll = true;
      },
      error: () => {
        const errorMessage: ChatMessage = {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: 'I apologize, but something went wrong while processing your request. Please try again.',
          timestamp: new Date(),
        };

        this.messages.update((list) => [...list, errorMessage]);
        this.isLoading.set(false);
        this.shouldScroll = true;
      },
    });
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  navigateToReservations(): void {
    this.closeChat();
    this.router.navigate(['/reservations']);
  }

  formatDate(dateStr: string): string {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  }

  formatTime(dateStr: string): string {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    } catch {
      return dateStr;
    }
  }

  private scrollToBottom(): void {
    try {
      if (this.messagesContainer?.nativeElement) {
        this.messagesContainer.nativeElement.scrollTop =
          this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.warn('[ChatWidget] Could not scroll to bottom', err);
    }
  }
}
