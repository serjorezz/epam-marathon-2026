import { TestBed } from "@angular/core/testing";
import { TranslatePipe } from "./translate.pipe";
import { TranslationService } from "@app/services/translation/translation.service";

describe("TranslatePipe", () => {
  let pipe: TranslatePipe;
  let service: TranslationService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [TranslationService],
    });
    service = TestBed.inject(TranslationService);
    pipe = TestBed.runInInjectionContext(() => new TranslatePipe());
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("should transform string according to active language", () => {
    expect(pipe.transform("Menu")).toBe("Menu");

    service.setLanguage("uk");
    expect(pipe.transform("Menu")).toBe("Меню");

    service.setLanguage("ka");
    expect(pipe.transform("Menu")).toBe("მენიუ");
  });

  it("should handle empty or null values gracefully", () => {
    expect(pipe.transform("")).toBe("");
    expect(pipe.transform(null)).toBe("");
    expect(pipe.transform(undefined)).toBe("");
  });
});
