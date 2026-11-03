# US2_Website Internationalization and Multi-language Support

| Field | Value |
| --- | --- |
| **Epic** | Localization & Internationalization |
| **US name** | Website Internationalization (Language Select) |
| **Role** | Guest / Customer / Staff |
| **Description** | As a visitor or user of Green & Tasty, I want to switch the website language between English, Ukrainian, and Georgian, and have my preferred language automatically detected on first visit, so that I can comfortably browse dishes, explore restaurant locations, and place bookings in my preferred language. |

### Pre-conditions:
- The user is visiting any page of the Green & Tasty web platform on a desktop or mobile device.
- The website has finished initial asset loading.

---

### Acceptance Criteria (AC):

1. **Dropdown Placement & Visibility**:
   - A language selector dropdown is placed in the top navigation header immediately following the GitHub link button.
   - On mobile screens, the language selector is also easily accessible within the mobile navigation drawer.

2. **Supported Languages & Flag Icons**:
   - The selector provides three language options, each clearly displaying a distinctive country flag icon preceding the language name:
     1. English (with United Kingdom flag icon)
     2. Ukrainian / Українська (with Ukrainian flag icon)
     3. Georgian / ქართული (with Georgian flag icon)
   - The active selected language is clearly highlighted or indicated on the trigger button with its flag and language code or label.

3. **Default Language, Browser Locale Detection & Persistence**:
   - On the very first visit (when no prior language preference has been saved in local storage), the application automatically detects the user's preferred language based on browser locale (`navigator.language` / `navigator.languages`).
   - If the browser locale corresponds to a supported language (Ukrainian -> `uk`, Georgian -> `ka`, English -> `en`), the website initializes in that language; otherwise, it defaults to English.
   - When a user explicitly selects a language from the dropdown, their choice is saved and persists across subsequent page visits, browser reloads, and navigation sessions, superseding automatic detection.

4. **Instant UI Re-rendering (No Page Refresh)**:
   - Selecting a new language immediately updates all user interface text throughout the current view and application without triggering a full page reload.

5. **Places / Locations Translation**:
   - All restaurant locations (names, street addresses, and venue descriptions) are translated and presented in the chosen language:
     - English: Original English location names, addresses (e.g., "112 Agmashenebeli Avenue"), and descriptions.
     - Ukrainian: Natural Ukrainian localized names, addresses (e.g., "проспект Агмашенебелі, 112"), and descriptions.
     - Georgian: Native Georgian script localized names, addresses (e.g., "აღმაშენებლის გამზირი 112"), and descriptions.

6. **Dishes & Menu Translation**:
   - All menu catalog and popular dishes (dish titles, detailed culinary descriptions, and food categories) are translated and presented in the chosen language:
     - English: Original English titles, weights, and descriptions.
     - Ukrainian: Natural Ukrainian culinary descriptions and names (e.g., "Хінкалі з дикими грибами", "Бадріджані з горіхами").
     - Georgian: Native Georgian culinary descriptions and names (e.g., "სოკოს ხინკალი", "ბადრიჯანი ნიგვზით").

7. **Accessibility & Responsive Behavior**:
   - The dropdown is accessible via keyboard navigation (focus, arrow keys, enter/space, escape).
   - The dropdown layout and flag icons fit cleanly within header constraints across all viewport widths without causing horizontal scrollbars or clipping.

---

### Assumptions & Open Questions (Optional):

- **Assumptions**:
  - Currency amounts ($ / USD) and numeric values (prices, table numbers, weights in grams) remain numeric while currency prefixes or labels adapt where relevant.
  - User reviews and guest-generated text comments submitted in a specific language remain in their original submitted language.
- **Open Questions**:
  - *UX / Product*: Should the application detect and suggest the user's preferred language based on browser locale (`navigator.language`) on the very first visit? -> **Resolved**: Implemented automatic browser locale detection for supported languages (UK, KA, EN) on first visit with fallback to English.
