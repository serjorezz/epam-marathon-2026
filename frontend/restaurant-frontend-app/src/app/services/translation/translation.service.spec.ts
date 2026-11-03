import { TestBed } from "@angular/core/testing";
import { TranslationService } from "./translation.service";

describe("TranslationService", () => {
  let service: TranslationService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [TranslationService],
    });
    service = TestBed.inject(TranslationService);
    service.setLanguage("en");
  });

  afterEach(() => {
    service.setLanguage("en");
    localStorage.clear();
  });

  it("should initialize with default language en", () => {
    expect(service.currentLanguage()).toBe("en");
    expect(service.activeLanguage().code).toBe("en");
    expect(service.activeLanguage().name).toBe("English");
  });

  it("should switch language and update activeLanguage signal", () => {
    service.setLanguage("uk");
    expect(service.currentLanguage()).toBe("uk");
    expect(service.activeLanguage().code).toBe("uk");
    expect(service.activeLanguage().nativeName).toBe("Українська");
    expect(localStorage.getItem("app_language")).toBe("uk");

    service.setLanguage("ka");
    expect(service.currentLanguage()).toBe("ka");
    expect(service.activeLanguage().code).toBe("ka");
    expect(service.activeLanguage().nativeName).toBe("ქართული");
  });

  it("should translate common UI strings into Ukrainian and Georgian", () => {
    service.setLanguage("en");
    expect(service.translate("Book a Table")).toBe("Book a Table");

    service.setLanguage("uk");
    expect(service.translate("Book a Table")).toBe("Забронювати стіл");
    expect(service.translate("Main page")).toBe("Головна");
    expect(service.translate("Green & Tasty Restaurants")).toBe("Ресторани Green & Tasty");
    expect(service.translate("Sign Out")).toBe("Вийти");
    expect(service.translate("Sort by")).toBe("Сортувати за");

    service.setLanguage("ka");
    expect(service.translate("Book a Table")).toBe("მაგიდის დაჯავშნა");
    expect(service.translate("Main page")).toBe("მთავარი");
    expect(service.translate("Green & Tasty Restaurants")).toBe("Green & Tasty რესტორნები");
    expect(service.translate("Sign Out")).toBe("გასვლა");
    expect(service.translate("Sort by")).toBe("დახარისხება");
  });

  it("should translate location addresses into Ukrainian and Georgian", () => {
    service.setLanguage("uk");
    expect(service.translate("112 Agmashenebeli Avenue")).toBe("проспект Агмашенебелі, 112");
    expect(service.translate("48 Rustaveli Avenue")).toBe("проспект Руставелі, 48");

    service.setLanguage("ka");
    expect(service.translate("112 Agmashenebeli Avenue")).toBe("აღმაშენებლის გამზირი 112");
    expect(service.translate("48 Rustaveli Avenue")).toBe("რუსთაველის გამზირი 48");
  });

  it("should translate dish names and descriptions into Ukrainian and Georgian", () => {
    service.setLanguage("uk");
    expect(service.translate("Wild Mushroom Khinkali (4 pcs)")).toBe("Хінкалі з дикими грибами (4 шт)");
    expect(service.translate("Badrijani Nigvzit (Walnut Eggplant Rolls)")).toBe("Бадріджані нігвзіт (баклажанові рулетики з горіхами)");

    service.setLanguage("ka");
    expect(service.translate("Wild Mushroom Khinkali (4 pcs)")).toBe("ტყის სოკოს ხინკალი (4 ც)");
    expect(service.translate("Badrijani Nigvzit (Walnut Eggplant Rolls)")).toBe("ბადრიჯანი ნიგვზით");
  });

  it("should translate table numbers dynamically", () => {
    service.setLanguage("uk");
    expect(service.translate("Table 21")).toBe("Стіл 21");
    expect(service.translate("Table 5")).toBe("Стіл 5");

    service.setLanguage("ka");
    expect(service.translate("Table 21")).toBe("მაგიდა 21");
    expect(service.translate("Table 5")).toBe("მაგიდა 5");
  });

  it("should translate guest counts dynamically", () => {
    service.setLanguage("uk");
    expect(service.translate("2 people")).toBe("2 особи");
    expect(service.translate("1 person")).toBe("1 особа");
    expect(service.translate("5 people")).toBe("5 осіб");

    service.setLanguage("ka");
    expect(service.translate("2 people")).toBe("2 ადამიანი");
    expect(service.translate("1 person")).toBe("1 ადამიანი");
    expect(service.translate("5 people")).toBe("5 ადამიანი");
  });

  it("should translate weights dynamically", () => {
    service.setLanguage("uk");
    expect(service.translate("380g")).toBe("380г");
    expect(service.translate("360g")).toBe("360г");
    expect(service.translate("/380g")).toBe("/380г");

    service.setLanguage("ka");
    expect(service.translate("380g")).toBe("380გ");
    expect(service.translate("360g")).toBe("360გ");
    expect(service.translate("/380g")).toBe("/380გ");
  });

  it("should translate dates and date ranges dynamically", () => {
    service.setLanguage("uk");
    expect(service.translate("Nov 5, 2026")).toBe("5 лист. 2026");
    expect(service.translate("Oct 4, 2026 – Nov 3, 2026")).toBe("4 жовт. 2026 – 3 лист. 2026");

    service.setLanguage("ka");
    expect(service.translate("Nov 5, 2026")).toBe("5 ნოე, 2026");
    expect(service.translate("Oct 4, 2026 – Nov 3, 2026")).toBe("4 ოქტ, 2026 – 3 ნოე, 2026");
  });

  it("should translate waiter reservations dashboard label", () => {
    service.setLanguage("uk");
    expect(service.translate("You have 0 reservations for any date, any time")).toBe(
      "У вас 0 бронювань на будь-яку дату, будь-який час"
    );

    service.setLanguage("ka");
    expect(service.translate("You have 0 reservations for any date, any time")).toBe(
      "თქვენ გაქვთ 0 ჯავშანი ნებისმიერი თარიღისთვის, ნებისმიერი დროისთვის"
    );
  });

  it("should translate vitamins and minerals", () => {
    service.setLanguage("uk");
    expect(service.translate("Vit C, Vit A, Calcium, and Ferum")).toBe(
      "Віт. C, Віт. A, кальцій та залізо"
    );

    service.setLanguage("ka");
    expect(service.translate("Vit C, Vit A, Calcium, and Ferum")).toBe(
      "ვიტ. C, ვიტ. A, კალციუმი და რკინა"
    );
  });

  it("should translate exact database atmosphere descriptions", () => {
    const desc =
      "Nestled in the historic heart of Old Tbilisi, our Baratashvili Street restaurant pairs traditional Georgian architectural charm with contemporary eco-friendly design. Guests can unwind on the sunlit veranda overlooking cobblestone streets and scenic hillside views, enjoying a tranquil, welcoming atmosphere perfect for leisurely family gatherings and romantic dinners.";

    service.setLanguage("uk");
    expect(service.translate(desc)).toContain("Затишно розташований в історичному центрі Старого Тбілісі");

    service.setLanguage("ka");
    expect(service.translate(desc)).toContain("ძველი თბილისის ისტორიულ გულში მდებარე");
  });

  it("should translate group order demo page phrases into Ukrainian and Georgian", () => {
    service.setLanguage("uk");
    expect(service.translate("Collecting pre-orders")).toBe("Збір передзамовлень");
    expect(service.translate("Sent to Restaurant")).toBe("Надіслано до ресторану");
    expect(service.translate("Rustaveli Avenue 48")).toBe("проспект Руставелі, 48");
    expect(service.translate("Wed, Oct 21, 2026")).toBe("Ср, 21 жовт. 2026");
    expect(
      service.translate("2 participants haven't submitted their cart yet — their dishes won't be included in the order")
    ).toBe("2 учасники ще не підтвердили свій кошик — їхні страви не будуть включені до замовлення");
    expect(
      service.translate("1 participant hasn't submitted their cart yet — their dishes won't be included in the order")
    ).toBe("1 учасник ще не підтвердив свій кошик — його страви не будуть включені до замовлення");
    expect(
      service.translate("5 participants haven't submitted their cart yet — their dishes won't be included in the order")
    ).toBe("5 учасників ще не підтвердили свій кошик — їхні страви не будуть включені до замовлення");
    expect(service.translate("Submitted")).toBe("Підтверджено");
    expect(service.translate("Avocado Pine Nut Bowl")).toBe("Боул з авокадо та кедровими горіхами");
    expect(service.translate("Guest")).toBe("Гість");
    expect(service.translate("Owner")).toBe("Організатор");
    expect(service.translate("Guest: Olena")).toBe("Гість: Olena");
    expect(service.translate("Owner: Yevhenii")).toBe("Організатор: Yevhenii");

    service.setLanguage("ka");
    expect(service.translate("Collecting pre-orders")).toBe("წინასწარი შეკვეთების შეგროვება");
    expect(service.translate("Sent to Restaurant")).toBe("გაგზავნილია რესტორანში");
    expect(service.translate("Rustaveli Avenue 48")).toBe("რუსთაველის გამზირი 48");
    expect(service.translate("Wed, Oct 21, 2026")).toBe("ოთხ, 21 ოქტ, 2026");
    expect(
      service.translate("2 participants haven't submitted their cart yet — their dishes won't be included in the order")
    ).toBe("2 მონაწილეს ჯერ არ დაუდასტურებია კალათა — მათი კერძები არ ჩაერთვება შეკვეთაში");
    expect(
      service.translate("1 participant hasn't submitted their cart yet — their dishes won't be included in the order")
    ).toBe("1 მონაწილეს ჯერ არ დაუდასტურებია კალათა — მისი კერძები არ ჩაერთვება შეკვეთაში");
    expect(service.translate("Submitted")).toBe("დადასტურებულია");
    expect(service.translate("Avocado Pine Nut Bowl")).toBe("ავოკადოსა და ფიჭვის კაკლის ბოული");
    expect(service.translate("Guest")).toBe("სტუმარი");
    expect(service.translate("Owner")).toBe("ორგანიზატორი");
    expect(service.translate("Guest: Olena")).toBe("სტუმარი: Olena");
    expect(service.translate("Owner: Yevhenii")).toBe("ორგანიზატორი: Yevhenii");
  });

  it("should translate reservation pre-order notice and composite reservation labels", () => {
    service.setLanguage("uk");
    expect(service.translate("You are making a pre-order for a reservation")).toBe(
      "Ви робите попереднє замовлення для бронювання"
    );
    expect(service.translate("Table table-r3")).toBe("Стіл table-r3");
    expect(
      service.translate("48 Rustaveli Avenue, Table table-r3, Tue Nov 03 2026, 18:00 - 19:30")
    ).toBe("проспект Руставелі, 48, Стіл table-r3, Вт, 03 лист. 2026, 18:00 - 19:30");
    expect(
      service.translate("48 Rustaveli Avenue, Table table-r3, Вт, 03 лист. 2026, 18:00 - 19:30")
    ).toBe("проспект Руставелі, 48, Стіл table-r3, Вт, 03 лист. 2026, 18:00 - 19:30");
    expect(
      service.translate("You are making a pre-order for a reservation 48 Rustaveli Avenue, Table table-r3, Вт, 03 лист. 2026, 18:00 - 19:30.")
    ).toBe(
      "Ви робите попереднє замовлення для бронювання проспект Руставелі, 48, Стіл table-r3, Вт, 03 лист. 2026, 18:00 - 19:30."
    );

    service.setLanguage("ka");
    expect(service.translate("You are making a pre-order for a reservation")).toBe(
      "თქვენ აკეთებთ წინასწარ შეკვეთას ჯავშნისთვის"
    );
    expect(service.translate("Table table-r3")).toBe("მაგიდა table-r3");
    expect(
      service.translate("48 Rustaveli Avenue, Table table-r3, Tue Nov 03 2026, 18:00 - 19:30")
    ).toBe("რუსთაველის გამზირი 48, მაგიდა table-r3, სამ, 03 ნოე, 2026, 18:00 - 19:30");
    expect(
      service.translate("You are making a pre-order for a reservation 48 Rustaveli Avenue, Table table-r3, Вт, 03 лист. 2026, 18:00 - 19:30.")
    ).toBe(
      "თქვენ აკეთებთ წინასწარ შეკვეთას ჯავშნისთვის რუსთაველის გამზირი 48, მაგიდა table-r3, სამ, 03 ნოე, 2026, 18:00 - 19:30."
    );
  });

  it("should return original text if translation key is not found", () => {
    service.setLanguage("uk");
    expect(service.translate("Unknown Custom Text")).toBe("Unknown Custom Text");
  });
  describe("browser language detection", () => {
    let originalLanguage: PropertyDescriptor | undefined;
    let originalLanguages: PropertyDescriptor | undefined;

    beforeEach(() => {
      originalLanguage = Object.getOwnPropertyDescriptor(navigator, "language");
      originalLanguages = Object.getOwnPropertyDescriptor(navigator, "languages");
    });

    afterEach(() => {
      if (originalLanguage) {
        Object.defineProperty(navigator, "language", originalLanguage);
      }
      if (originalLanguages) {
        Object.defineProperty(navigator, "languages", originalLanguages);
      }
    });

    it("should detect Ukrainian language from browser locale", () => {
      Object.defineProperty(navigator, "language", { value: "uk-UA", configurable: true });
      Object.defineProperty(navigator, "languages", { value: ["uk-UA", "en-US"], configurable: true });

      expect(service.detectBrowserLanguage(false)).toBe("uk");
    });

    it("should detect Georgian language from browser locale", () => {
      Object.defineProperty(navigator, "language", { value: "ka-GE", configurable: true });
      Object.defineProperty(navigator, "languages", { value: ["ka-GE", "en"], configurable: true });

      expect(service.detectBrowserLanguage(false)).toBe("ka");
    });

    it("should fallback to English for unsupported or English locales", () => {
      Object.defineProperty(navigator, "language", { value: "fr-FR", configurable: true });
      Object.defineProperty(navigator, "languages", { value: ["fr-FR", "es"], configurable: true });

      expect(service.detectBrowserLanguage(false)).toBe("en");
    });
  });
});
