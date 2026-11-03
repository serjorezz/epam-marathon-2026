import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ChatService } from './chat.service';

describe('ChatService', () => {
  let service: ChatService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ChatService],
    });
    service = TestBed.inject(ChatService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return a mocked funny response without network call', fakeAsync(() => {
    let result: string | undefined;

    service.sendMessage$({ message: 'Hello AI' }).subscribe((res) => {
      result = res.reply;
    });

    tick(600);

    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
    expect(result).toContain('Beep boop!');
  }));

  it('should cycle through predefined humoristic responses on subsequent messages', fakeAsync(() => {
    let reply1 = '';
    let reply2 = '';

    service.sendMessage$({ message: 'First' }).subscribe((res) => {
      reply1 = res.reply;
    });
    tick(600);

    service.sendMessage$({ message: 'Second' }).subscribe((res) => {
      reply2 = res.reply;
    });
    tick(600);

    expect(reply1).toBeTruthy();
    expect(reply2).toBeTruthy();
    expect(reply1).not.toBe(reply2);
  }));
});
