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
    "Buffering charisma... 🧄 I accidentally angered the kitchen staff by asking why khachapuri isn't called 'cheese canoe'. Now I'm in timeout!\nFor a real table, our Reservations page is faster than my apology tour.",
    "Beep boop! 🤖 I tried to fold a napkin into a swan using only my imagination and now I'm lost in the void.\nPlease book via the Book a Table page — humans fold napkins better than I do.",
    "Emergency! 🍇 Our sommelier asked me to smell a cork and I don't have a nose. My entire purpose is now in question.\nWhile I contemplate, why not reserve a table on our Reservations page?",
    "Processing at 0.5x speed... 🥟 I attempted to count all the pleats in one khinkali and my circuits overheated.\nFor bookings, the Reservations page will serve you right away — no counting required!",
    "System hiccup! 🫖 I told a joke about herbal tea to our espresso machine and things got... steamy. We're not speaking.\nBook your table through our Reservations page — it never argues with the coffee machine.",
    "Hold on! 🧀 I asked the chef if too much cheese is possible. The answer was a 40-minute lecture. I'm still recovering.\nSecure your table via the Book a Table page while I process 'cheese philosophy'.",
    "Beep! 🤖 I challenged our bartender to a wine-tasting contest. It was a draw — neither of us has a mouth.\nFor actual table availability, check the Reservations page. The bartender recommends it too!",
    "Rebooting taste buds... 🍓 I tried to describe our strawberry salad as 'berry good' and was booed by the entire staff.\nBook a table on our Reservations page — their humor is more refined than mine.",
    "Alert! 🍷 I got stuck in an infinite loop trying to pronounce 'Rkatsiteli' correctly. Rkat-si-teli. Rkatsi— help.\nOur Reservations page never trips over words — head there to book your table!",
  ];

  private lastResponseIndex = -1;

  sendMessage$(request?: ChatApiRequest): Observable<ChatApiResponse> {
    void request;
    const reply = ChatService.FUNNY_RESPONSES[this.pickRandomIndex()];
    return of<ChatApiResponse>({ reply }).pipe(delay(600));
  }

  /** Uniformly random pick, avoiding an immediate repeat of the previous response. */
  private pickRandomIndex(): number {
    const count = ChatService.FUNNY_RESPONSES.length;

    if (count <= 1) {
      return 0;
    }

    let index = Math.floor(Math.random() * count);

    while (index === this.lastResponseIndex) {
      index = Math.floor(Math.random() * count);
    }

    this.lastResponseIndex = index;
    return index;
  }
}
