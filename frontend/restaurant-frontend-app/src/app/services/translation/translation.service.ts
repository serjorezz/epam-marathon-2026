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

    // 1. Direct dictionary match
    if (dict && dict[trimmed] !== undefined) {
      return dict[trimmed];
    }

    if (lang === "en" && !/[^\x20-\x7E\t\r\n]/.test(trimmed)) {
      return keyOrText;
    }

    // 2. Pre-order notice prefix check:
    // e.g. "You are making a pre-order for a reservation 48 Rustaveli Avenue, Table table-r3, Вт, 03 лист. 2026, 18:00 - 19:30."
    const preOrderNoticeMatch = trimmed.match(
      /^(?:You are making a pre-order for (?:a|the) reservation|Ви робите попереднє замовлення для бронювання|თქვენ აკეთებთ წინასწარ შეკვეთას ჯავშნისთვის)\s*(.*?)(?:\.?)?$/i
    );
    if (preOrderNoticeMatch) {
      const rest = preOrderNoticeMatch[1].replace(/\.$/, '').trim();
      const prefixUk = "Ви робите попереднє замовлення для бронювання";
      const prefixKa = "თქვენ აკეთებთ წინასწარ შეკვეთას ჯავშნისთვის";
      const prefixEn = "You are making a pre-order for a reservation";
      const prefix = lang === "uk" ? prefixUk : lang === "ka" ? prefixKa : prefixEn;
      if (!rest) {
        return prefix;
      }
      const translatedRest = this.translate(rest);
      return `${prefix} ${translatedRest}.`;
    }

    // 3. Table numbers pattern: "Table 21", "Table table-r3", "Стіл table-r3" -> "Стіл ..." / "მაგიდა ..."
    const tableMatch = trimmed.match(/^(?:Table|Стіл|მაგიდა)\s+([a-zA-Z0-9_-]+)$/i);
    if (tableMatch) {
      const num = tableMatch[1];
      if (lang === "uk") return `Стіл ${num}`;
      if (lang === "ka") return `მაგიდა ${num}`;
      return `Table ${num}`;
    }

    const tableUnknownMatch = trimmed.match(/^(?:Table|Стіл|მაგიდა)\s*\((.*?)\)$/i);
    if (tableUnknownMatch) {
      if (lang === "uk") return `Стіл (невідомо)`;
      if (lang === "ka") return `მაგიდა (უცნობი)`;
      return `Table (unknown)`;
    }

    // 4. Pure date or date ranges (e.g. "Nov 5, 2026", "Oct 4, 2026 – Nov 3, 2026", "Wed, Oct 21, 2026")
    const datePureRegex = /^(?:(?:Mon(?:day)?|Tue(?:sday)?|Wed(?:nesday)?|Thu(?:rsday)?|Fri(?:day)?|Sat(?:urday)?|Sun(?:day)?|Пн|Вт|Ср|Чт|Пт|Сб|Нд),?\s+)?(?:(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2}|\d{1,2}\s+(?:січ|лют|бер|кві|тра|чер|лип|сер|вер|жов|лист|груд)(?:\.|\b))\s*(?:,?\s+\d{4})?(?:\s*[–-]\s*(?:(?:Mon(?:day)?|Tue(?:sday)?|Wed(?:nesday)?|Thu(?:rsday)?|Fri(?:day)?|Sat(?:urday)?|Sun(?:day)?|Пн|Вт|Ср|Чт|Пт|Сб|Нд),?\s+)?(?:(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2}|\d{1,2}\s+(?:січ|лют|бер|кві|тра|чер|лип|сер|вер|жов|лист|груд)(?:\.|\b))\s*(?:,?\s+\d{4})?)?$/i;
    if (datePureRegex.test(trimmed)) {
      const dateFormatted = this.translateDates(trimmed, lang);
      if (dateFormatted !== trimmed) {
        return dateFormatted;
      }
    }

    // Composite reservation details: Address, Table, Date/Time
    const resLabelMatch = trimmed.match(/^(.*?),\s*((?:Table|Стіл|მაგიდა)\s+[a-zA-Z0-9_-]+),\s*(.*)$/i);
    if (resLabelMatch) {
      const address = this.translate(resLabelMatch[1]);
      const table = this.translate(resLabelMatch[2]);
      const dateTime = this.translateDates(resLabelMatch[3], lang);
      return `${address}, ${table}, ${dateTime}`;
    }

    // 5. Composite comma-separated strings
    if (trimmed.includes(', ')) {
      const parts = trimmed.split(', ');
      const translatedParts = parts.map((part) => this.translate(part.trim()));
      if (translatedParts.some((p, i) => p !== parts[i].trim())) {
        return translatedParts.join(', ');
      }
    }

    // 6. Guest count pattern: "2 people", "1 person", "5 people"
    const peopleMatch = trimmed.match(/^(\d+)\s+people$/i);
    if (peopleMatch) {
      const count = Number(peopleMatch[1]);
      if (lang === "uk") {
        const mod10 = count % 10;
        const mod100 = count % 100;
        if (mod10 === 1 && mod100 !== 11) return `${count} особа`;
        if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return `${count} особи`;
        return `${count} осіб`;
      }
      if (lang === "ka") {
        return `${count} ადამიანი`;
      }
      return keyOrText;
    }

    const personMatch = trimmed.match(/^1\s+person$/i);
    if (personMatch) {
      if (lang === "uk") return "1 особа";
      if (lang === "ka") return "1 ადამიანი";
      return keyOrText;
    }

    // 7. Weight pattern: "380g", "/380g", "380 g"
    const weightMatch = trimmed.match(/^(\/)?(\d+)(\s*)g$/i);
    if (weightMatch) {
      const slash = weightMatch[1] || "";
      const num = weightMatch[2];
      const space = weightMatch[3] || "";
      if (lang === "uk") return `${slash}${num}${space}г`;
      if (lang === "ka") return `${slash}${num}${space}გ`;
      return keyOrText;
    }

    // 8. Waiter dashboard reservations label:
    // "You have 0 reservations for any date, any time"
    const reservationsMatch = trimmed.match(/^You have (\d+) reservation(s?) for (.*?), (.*?)$/i);
    if (reservationsMatch) {
      const count = Number(reservationsMatch[1]);
      const rawDate = reservationsMatch[3];
      const rawTime = reservationsMatch[4];
      if (lang === "uk") {
        let word = "бронювань";
        const mod10 = count % 10;
        const mod100 = count % 100;
        if (mod10 === 1 && mod100 !== 11) word = "бронювання";
        else if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) word = "бронювання";

        const dateUk = rawDate === "any date" ? "будь-яку дату" : this.translate(rawDate);
        const timeUk = rawTime === "any time" ? "будь-який час" : this.translate(rawTime);
        return `У вас ${count} ${word} на ${dateUk}, ${timeUk}`;
      }
      if (lang === "ka") {
        const dateKa = rawDate === "any date" ? "ნებისმიერი თარიღისთვის" : this.translate(rawDate);
        const timeKa = rawTime === "any time" ? "ნებისმიერი დროისთვის" : this.translate(rawTime);
        return `თქვენ გაქვთ ${count} ჯავშანი ${dateKa}-სთვის, ${timeKa}-სთვის`;
      }
      return keyOrText;
    }

    // 9. Dynamic unsubmitted cart warning:
    // e.g. "2 participants haven't submitted their cart yet — their dishes won't be included in the order"
    const unsubmittedMatch = trimmed.match(
      /^(\d+)\s+participant(?:s?)\s+(?:hasn't|haven't)\s+submitted their cart yet\s*([—–-])\s*their dishes won't be included in the order$/i
    );
    if (unsubmittedMatch) {
      const count = Number(unsubmittedMatch[1]);
      if (lang === "uk") {
        const mod10 = count % 10;
        const mod100 = count % 100;
        if (count === 1) {
          return "1 учасник ще не підтвердив свій кошик — його страви не будуть включені до замовлення";
        }
        if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
          return `${count} учасники ще не підтвердили свій кошик — їхні страви не будуть включені до замовлення`;
        }
        return `${count} учасників ще не підтвердили свій кошик — їхні страви не будуть включені до замовлення`;
      }
      if (lang === "ka") {
        if (count === 1) {
          return "1 მონაწილეს ჯერ არ დაუდასტურებია კალათა — მისი კერძები არ ჩაერთვება შეკვეთაში";
        }
        return `${count} მონაწილეს ჯერ არ დაუდასტურებია კალათა — მათი კერძები არ ჩაერთვება შეკვეთაში`;
      }
      return keyOrText;
    }

    // 10. Dynamic participant titles: "Guest: Olena", "Owner: Yevhenii"
    const guestMatch = trimmed.match(/^Guest:\s*(.+)$/i);
    if (guestMatch) {
      const name = guestMatch[1];
      if (lang === "uk") return `Гість: ${name}`;
      if (lang === "ka") return `სტუმარი: ${name}`;
      return `Guest: ${name}`;
    }

    const ownerMatch = trimmed.match(/^Owner:\s*(.+)$/i);
    if (ownerMatch) {
      const name = ownerMatch[1];
      if (lang === "uk") return `Організатор: ${name}`;
      if (lang === "ka") return `ორგანიზატორი: ${name}`;
      return `Owner: ${name}`;
    }

    // 11. Dates and date ranges fallback
    const dateFormatted = this.translateDates(trimmed, lang);
    if (dateFormatted !== trimmed) {
      return dateFormatted;
    }

    return keyOrText;
  }

  localizeDish(dish: DishListResponse): DishListResponse {
    return {
      ...dish,
      name: this.translate(dish.name),
      description: this.translate(dish.description),
      dishType: this.translate(dish.dishType),
      weight: this.translate(dish.weight),
    };
  }

  localizeLocation(location: LocationResponse): LocationResponse {
    return {
      ...location,
      address: this.translate(location.address),
      description: this.translate(location.description),
    };
  }

  private translateDates(text: string, lang: AppLanguage): string {
    const monthMapUk: Record<string, string> = {
      jan: "січ", january: "січня",
      feb: "лют", february: "лютого",
      mar: "бер", march: "березня",
      apr: "квіт", april: "квітня",
      may: "трав",
      jun: "черв", june: "червня",
      jul: "лип", july: "липня",
      aug: "серп", august: "серпня",
      sep: "вер", september: "вересня",
      oct: "жовт", october: "жовтня",
      nov: "лист", november: "листопада",
      dec: "груд", december: "грудня",
    };

    const monthMapKa: Record<string, string> = {
      jan: "იან", january: "იანვარი",
      feb: "თებ", february: "თებერვალი",
      mar: "მარ", march: "მარტი",
      apr: "აპრ", april: "აპრილი",
      may: "მაი",
      jun: "ივნ", june: "ივნისი",
      jul: "ივლ", july: "ივლისი",
      aug: "აგვ", august: "აგვისტო",
      sep: "სექ", september: "სექტემბერი",
      oct: "ოქტ", october: "ოქტომბერი",
      nov: "ნოე", november: "ნოემბერი",
      dec: "დეკ", december: "დეკემბერი",
    };

    const weekdayMapUk: Record<string, string> = {
      mon: "Пн", monday: "Понеділок",
      tue: "Вт", tuesday: "Вівторок",
      wed: "Ср", wednesday: "Середа",
      thu: "Чт", thursday: "Четвер",
      fri: "П'ятниця", friday: "П'ятниця",
      sat: "Сб", saturday: "Субота",
      sun: "Нд", sunday: "Неділя",
    };

    const weekdayMapKa: Record<string, string> = {
      mon: "ორშ", monday: "ორშაბათი",
      tue: "სამ", tuesday: "სამშაბათი",
      wed: "ოთხ", wednesday: "ოთხშაბათი",
      thu: "ხუთ", thursday: "ხუთშაბათი",
      fri: "პარ", friday: "პარასკევი",
      sat: "შაბ", saturday: "შაბათი",
      sun: "კვ", sunday: "კვირა",
    };

    const monthMap = lang === "uk" ? monthMapUk : monthMapKa;
    const weekdayMap = lang === "uk" ? weekdayMapUk : weekdayMapKa;

    // Pattern with optional weekday: e.g. "Wed, Oct 21, 2026" or "Oct 4, 2026" or "Tue Nov 03 2026"
    let result = text.replace(
      /\b(?:(Mon(?:day)?|Tue(?:sday)?|Wed(?:nesday)?|Thu(?:rsday)?|Fri(?:day)?|Sat(?:urday)?|Sun(?:day)?),?\s+)?(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{1,2}),?\s+(\d{4})\b/gi,
      (match, weekday, m, d, y) => {
        const transMonth = monthMap[m.toLowerCase()];
        if (!transMonth) return match;
        const transDay = weekday ? (weekdayMap[weekday.toLowerCase()] || weekday) : '';
        const prefix = transDay ? `${transDay}, ` : '';
        if (lang === "uk") {
          return `${prefix}${d} ${transMonth}. ${y}`;
        }
        return `${prefix}${d} ${transMonth}, ${y}`;
      }
    );

    // If single month + day without year (e.g. "Nov 5")
    result = result.replace(
      /\b(?:(Mon(?:day)?|Tue(?:sday)?|Wed(?:nesday)?|Thu(?:rsday)?|Fri(?:day)?|Sat(?:urday)?|Sun(?:day)?),?\s+)?(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{1,2})\b/gi,
      (match, weekday, m, d) => {
        const transMonth = monthMap[m.toLowerCase()];
        if (!transMonth) return match;
        const transDay = weekday ? (weekdayMap[weekday.toLowerCase()] || weekday) : '';
        const prefix = transDay ? `${transDay}, ` : '';
        if (lang === "uk") {
          return `${prefix}${d} ${transMonth}.`;
        }
        return `${prefix}${d} ${transMonth}`;
      }
    );

    // Cross-translation: Ukrainian date into Georgian or English
    if (lang === "ka") {
      const monthMapUkToKa: Record<string, string> = {
        січ: "იან", лют: "თებ", бер: "მარ", кві: "აპრ", тра: "მაი", чер: "ივნ",
        лип: "ივლ", сер: "აგვ", вер: "სექ", жов: "ოქტ", лист: "ნოე", груд: "დეკ",
      };
      const weekdayMapUkToKa: Record<string, string> = {
        пн: "ორშ", вт: "სამ", ср: "ოთხ", чт: "ხუთ", пт: "პარ", сб: "შაბ", нд: "კვ",
      };
      result = result.replace(
        /(?:(Пн|Вт|Ср|Чт|Пт|Сб|Нд),?\s+)?(\d{1,2})\s+(січ|лют|бер|кві|тра|чер|лип|сер|вер|жов|лист|груд)(?:\.|\b)\s*(\d{4})?/gi,
        (match, weekday, d, m, y) => {
          const transMonth = monthMapUkToKa[m.toLowerCase()] || m;
          const transDay = weekday ? (weekdayMapUkToKa[weekday.toLowerCase()] || weekday) : '';
          const prefix = transDay ? `${transDay}, ` : '';
          return y ? `${prefix}${d} ${transMonth}, ${y}` : `${prefix}${d} ${transMonth}`;
        }
      );
    } else if (lang === "en") {
      const monthMapUkToEn: Record<string, string> = {
        січ: "Jan", лют: "Feb", бер: "Mar", кві: "Apr", тра: "May", чер: "Jun",
        лип: "Jul", сер: "Aug", вер: "Sep", жов: "Oct", лист: "Nov", груд: "Dec",
      };
      const weekdayMapUkToEn: Record<string, string> = {
        пн: "Mon", вт: "Tue", ср: "Wed", чт: "Thu", пт: "Fri", сб: "Sat", нд: "Sun",
      };
      result = result.replace(
        /(?:(Пн|Вт|Ср|Чт|Пт|Сб|Нд),?\s+)?(\d{1,2})\s+(січ|лют|бер|кві|тра|чер|лип|сер|вер|жов|лист|груд)(?:\.|\b)\s*(\d{4})?/gi,
        (match, weekday, d, m, y) => {
          const transMonth = monthMapUkToEn[m.toLowerCase()] || m;
          const transDay = weekday ? (weekdayMapUkToEn[weekday.toLowerCase()] || weekday) : '';
          const prefix = transDay ? `${transDay}, ` : '';
          return y ? `${prefix}${transMonth} ${d}, ${y}` : `${prefix}${transMonth} ${d}`;
        }
      );
    }

    return result;
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
    return this.detectBrowserLanguage();
  }

  detectBrowserLanguage(isTestEnvCheck = true): AppLanguage {
    const win = typeof window !== "undefined" ? (window as unknown as Record<string, unknown>) : null;
    if (isTestEnvCheck && win && (Boolean(win['__karma__']) || Boolean(win['jasmine']))) {
      return "en";
    }

    try {
      if (typeof navigator !== "undefined") {
        const locales = navigator.languages?.length ? navigator.languages : [navigator.language];
        for (const loc of locales) {
          if (!loc) continue;
          const lower = loc.toLowerCase();
          if (lower.startsWith("uk")) {
            return "uk";
          }
          if (lower.startsWith("ka")) {
            return "ka";
          }
          if (lower.startsWith("en")) {
            return "en";
          }
        }
      }
    } catch {
      // Ignore detection errors
    }
    return "en";
  }
}
