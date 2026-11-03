import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatWidgetComponent } from './chat-widget.component';
import { ChatService } from '@app/services/chat/chat.service';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';

describe('ChatWidgetComponent', () => {
  let component: ChatWidgetComponent;
  let fixture: ComponentFixture<ChatWidgetComponent>;
  let mockChatService: jasmine.SpyObj<ChatService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockChatService = jasmine.createSpyObj('ChatService', ['sendMessage$']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ChatWidgetComponent],
      providers: [
        { provide: ChatService, useValue: mockChatService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ChatWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the chat widget component', () => {
    expect(component).toBeTruthy();
    expect(component.isOpen()).toBeFalse();
    expect(component.messages().length).toBe(1);
    expect(component.messages()[0].sender).toBe('assistant');
  });

  it('should toggle chat window open and closed', () => {
    component.toggleChat();
    expect(component.isOpen()).toBeTrue();

    component.toggleChat();
    expect(component.isOpen()).toBeFalse();
  });

  it('should close chat window when closeChat is called', () => {
    component.toggleChat();
    expect(component.isOpen()).toBeTrue();

    component.closeChat();
    expect(component.isOpen()).toBeFalse();
  });

  it('should not send an empty message', () => {
    component.inputMessage.set('   ');
    component.sendMessage();

    expect(mockChatService.sendMessage$).not.toHaveBeenCalled();
    expect(component.messages().length).toBe(1);
  });

  it('should send user message and append assistant response', () => {
    mockChatService.sendMessage$.and.returnValue(
      of({
        reply: 'We have tables available tomorrow at 18:00.',
      })
    );

    component.inputMessage.set('Do you have tables tomorrow?');
    component.sendMessage();

    expect(mockChatService.sendMessage$).toHaveBeenCalled();
    expect(component.messages().length).toBe(3);
    expect(component.messages()[1].sender).toBe('user');
    expect(component.messages()[1].text).toBe('Do you have tables tomorrow?');
    expect(component.messages()[2].sender).toBe('assistant');
    expect(component.messages()[2].text).toBe('We have tables available tomorrow at 18:00.');
    expect(component.inputMessage()).toBe('');
    expect(component.isLoading()).toBeFalse();
  });

  it('should display reservation details when assistant creates a booking', () => {
    mockChatService.sendMessage$.and.returnValue(
      of({
        reply: 'Your table has been booked!',
        reservation: {
          id: 'res-999',
          startTime: '2026-11-04T18:00:00Z',
          endTime: '2026-11-04T19:30:00Z',
          guestCount: 2,
          address: '48 Rustaveli Avenue',
          customerName: 'Alex',
          status: 'Reserved',
        },
      })
    );

    component.inputMessage.set('Please book table for Alex tomorrow 18:00');
    component.sendMessage();

    expect(component.messages().length).toBe(3);
    const lastMsg = component.messages()[2];
    expect(lastMsg.reservation).toBeDefined();
    expect(lastMsg.reservation?.id).toBe('res-999');
    expect(lastMsg.reservation?.address).toBe('48 Rustaveli Avenue');
  });

  it('should handle error from chat service gracefully', () => {
    mockChatService.sendMessage$.and.returnValue(throwError(() => new Error('Network error')));

    component.inputMessage.set('Hello?');
    component.sendMessage();

    expect(component.messages().length).toBe(3);
    expect(component.messages()[2].sender).toBe('assistant');
    expect(component.messages()[2].text).toContain('something went wrong');
    expect(component.isLoading()).toBeFalse();
  });

  it('should navigate to reservations page and close chat on navigateToReservations', () => {
    component.toggleChat();
    expect(component.isOpen()).toBeTrue();

    component.navigateToReservations();
    expect(component.isOpen()).toBeFalse();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/reservations']);
  });
});
