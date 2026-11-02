import { Injectable, signal, computed } from "@angular/core";
import { AppLanguage, LanguageOption, SUPPORTED_LANGUAGES, TRANSLATIONS } from "./translation.data";
import { DishListResponse } from "@app/models/dishes/dish-list-response.model";
import { LocationResponse } from "@app/models/locations/location-response.model";

@Injectable({
  providedIn: "root",
})
export class TranslationService {
  private readonly storageKey = "app_language";

  readonly currentLanguage = signal<AppLanguage>(this.getInitialLanguage());

  readonly supportedLanguages = SUPPORTED_LANGUAGES;

  readonly activeLanguage = computed<LanguageOption>(() => {
    const code = this.currentLanguage();
    return this.supportedLanguages.find((lang) => lang.code === code) || this.supportedLanguages[0];
  });

  setLanguage(lang: AppLanguage): void {
    if (this.supportedLanguages.some((l) => l.code === lang)) {
      this.currentLanguage.set(lang);
      try {
        localStorage.setItem(this.storageKey, lang);
      } catch {
        // Ignore localStorage errors
      }
    }
  }

  translate(keyOrText: string | undefined | null): string {
    if (!keyOrText) return "";
    const trimmed = keyOrText.trim();
    const lang = this.currentLanguage();
    const dict = TRANSLATIONS[lang];
    if (dict && dict[trimmed] !== undefined) {
      return dict[trimmed];
    }
    return keyOrText;
  }

  localizeDish(dish: DishListResponse): DishListResponse {
    return {
      ...dish,
      name: this.translate(dish.name),
      description: this.translate(dish.description),
      dishType: this.translate(dish.dishType),
    };
  }

  localizeLocation(location: LocationResponse): LocationResponse {
    return {
      ...location,
      address: this.translate(location.address),
      description: this.translate(location.description),
    };
  }

  private getInitialLanguage(): AppLanguage {
    try {
      const saved = localStorage.getItem(this.storageKey) as AppLanguage | null;
      if (saved && SUPPORTED_LANGUAGES.some((l) => l.code === saved)) {
        return saved;
      }
    } catch {
      // Fallback
    }
    return "en";
  }
}
