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
    expect(result!.length).toBeGreaterThan(0);
  }));

  it('should pick responses randomly and never repeat the previous one immediately', fakeAsync(() => {
    const replies: string[] = [];

    for (let i = 0; i < 15; i++) {
      service.sendMessage$({ message: `Message ${i}` }).subscribe((res) => {
        replies.push(res.reply);
      });
      tick(600);
    }

    expect(replies).toHaveSize(15);

    for (let i = 1; i < replies.length; i++) {
      expect(replies[i]).not.toBe(replies[i - 1]);
    }

    // Random picking should produce more than one distinct phrase over 15 draws
    expect(new Set(replies).size).toBeGreaterThan(1);
  }));
});
