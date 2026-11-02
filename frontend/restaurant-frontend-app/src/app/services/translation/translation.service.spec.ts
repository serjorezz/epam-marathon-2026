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
  });

  afterEach(() => {
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

    service.setLanguage("ka");
    expect(service.translate("Book a Table")).toBe("მაგიდის დაჯავშნა");
    expect(service.translate("Main page")).toBe("მთავარი");
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

  it("should return original text if translation key is not found", () => {
    service.setLanguage("uk");
    expect(service.translate("Unknown Custom Text")).toBe("Unknown Custom Text");
  });
});
