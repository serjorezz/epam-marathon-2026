import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { ChatApiRequest, ChatApiResponse } from '@app/models/chat/chat.model';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private static readonly FUNNY_RESPONSES: string[] = [
    "Beep boop! 🤖 I’m currently staring blankly at a wall, wondering if a dumpling counts as a ravioli, so I can't chat right now.\nFor urgent matters (like begging our chef for extra garlic sauce), please call us directly or flag down a waiter in real life or visit our Book a Table page directly. Back in a sec!",
    "Hold on! 🥑 I just got into a heated philosophical debate with our blender about whether guacamole is technically a smoothie.\nFor table reservations, check out our Reservations page or grab a friendly waiter in person!",
    "Error 418: I am a teapot... wait, no, I am a restaurant AI having an existential crisis about cilantro. 🌿\nIf you need a table, please hop over to the Reservations tab or call us directly!",
    "Beep! 🤖 The chef caught me trying to calculate the mathematical perfection of our walnut sauce, and now I'm temporarily exiled from the kitchen.\nFor bookings, please use our Book a Table page or ask a server!",
    "Shhh! 🍷 I'm currently pretending to be an amber wine barrel aging in our cellar. Don't blow my cover!\nFor tables and urgent food emergencies, visit our Reservations page or give us a ring.",
    "System alert: My neural circuits were distracted by the irresistible scent of warm Khachapuri. 🧀 I am currently non-functional due to drooling.\nHead to our Reservations page to secure your spot!",
    "Processing... 1%... 2%... 🍕 Did you know pizza is technically a pie chart of how much happiness you have left? Anyway, I'm taking a micro-nap.\nPlease use the Book a Table page or flag down a human waiter!",
    "Beep boop! 🤖 Our sommeliers told me I need a palate before recommending pairings, so I'm currently trying to download taste buds.\nIn the meantime, head over to the Reservations tab to book your feast!",
    "Loading witty comeback... 🤖 Unfortunately, my humor module crashed after attempting to understand why hot dogs come in packs of 10 and buns in packs of 8.\nPlease visit our Reservations page to book a table!",
    "Hold that thought! 🌿 I am busy lecturing a mushroom on the benefits of being fungi.\nFor table bookings, head straight to our Book a Table page or call our team!",
  ];

  private responseIndex = 0;

  sendMessage$(request?: ChatApiRequest): Observable<ChatApiResponse> {
    void request;
    const reply =
      ChatService.FUNNY_RESPONSES[this.responseIndex % ChatService.FUNNY_RESPONSES.length];
    this.responseIndex++;
    return of<ChatApiResponse>({ reply }).pipe(delay(600));
  }
}
