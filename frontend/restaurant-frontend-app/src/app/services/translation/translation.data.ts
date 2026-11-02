export type AppLanguage = "en" | "uk" | "ka";

export interface LanguageOption {
  code: AppLanguage;
  name: string;
  nativeName: string;
  flagUrl: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  {
    code: "en",
    name: "English",
    nativeName: "English",
    flagUrl: "assets/svg/flags/en.svg",
  },
  {
    code: "uk",
    name: "Ukrainian",
    nativeName: "Українська",
    flagUrl: "assets/svg/flags/uk.svg",
  },
  {
    code: "ka",
    name: "Georgian",
    nativeName: "ქართული",
    flagUrl: "assets/svg/flags/ka.svg",
  },
];

export const TRANSLATIONS: Record<AppLanguage, Record<string, string>> = {
  en: {
    // Navigation
    "Green by nature, Georgian by heart.": "Green by nature, Georgian by heart.",
    "Seasonal bowls • Vegan friendly • Tbilisi": "Seasonal bowls • Vegan friendly • Tbilisi.",
    "Most Popular Dishes": "Most Popular Dishes",
    "Locations": "Locations",
    "View Menu": "View Menu",
    "Price: Low to high": "Price: Low to high",
    "Price: High to low": "Price: High to low",
    "Recommended": "Recommended",
    "Main page": "Main page",
    "Book a Table": "Book a Table",
    "Reservations": "Reservations",
    "Menu": "Menu",
    "Reports": "Reports",
    "Sign In": "Sign In",
    "Sign Out": "Sign Out",
    "My Profile": "My Profile",
    "Cart": "Cart",
    "Notifications": "Notifications",
    "Language": "Language",

    // Common UI
    "Sort by:": "Sort by:",
    "Date / Time (Earliest first)": "Date / Time (Earliest first)",
    "Date / Time (Latest first)": "Date / Time (Latest first)",
    "Guests (High to Low)": "Guests (High to Low)",
    "Guests (Low to High)": "Guests (Low to High)",
    "Restaurant (A to Z)": "Restaurant (A to Z)",
    "Restaurant (Z to A)": "Restaurant (Z to A)",
    "Book a table": "Book a table",
    "Find a Table": "Find a Table",
    "Pre-Order": "Pre-Order",
    "Pre-order": "Pre-order",
    "All dishes": "All dishes",
    "Popular Dishes": "Popular Dishes",
    "Our Locations": "Our Locations",
    "Customer Reviews": "Customer Reviews",
    "Atmosphere": "Atmosphere",
    "View menu": "View menu",
    "Hello,": "Hello,",
    "No new notifications": "No new notifications",
    "Please wait while we load your reservations.": "Please wait while we load your reservations.",
    "It looks like you don't have any reservations.": "It looks like you don't have any reservations.",
    "Daily occupancy:": "Daily occupancy:",
    "tables": "tables",
    "table": "table",
    "people": "people",
    "person": "person",
    "Reserved": "Reserved",
    "Cancelled": "Cancelled",
    "In Progress": "In Progress",
    "Finished": "Finished",
    "Calories:": "Calories:",
    "Protein:": "Protein:",
    "Fats:": "Fats:",
    "Carbs:": "Carbs:",
    "Vitamins & minerals:": "Vitamins & minerals:",

    // Categories
    "Appetizers": "Appetizers",
    "Main Courses": "Main Courses",
    "MainCourse": "Main Courses",
    "Desserts": "Desserts",
    "Dessert": "Desserts",

    // Places / Locations Addresses
    "14 Baratashvili Street": "14 Baratashvili Street",
    "9 Abashidze Street": "9 Abashidze Street",
    "48 Rustaveli Avenue": "48 Rustaveli Avenue",
    "24 Chavchavadze Avenue": "24 Chavchavadze Avenue",
    "112 Agmashenebeli Avenue": "112 Agmashenebeli Avenue",
    "31 Pekini Avenue": "31 Pekini Avenue",
    "7 Marjanishvili Street": "7 Marjanishvili Street",
    "19 Vakhtang Gorgasali Street": "19 Vakhtang Gorgasali Street",

    // Dishes Names
    "Avocado & Pine Nut Bowl": "Avocado & Pine Nut Bowl",
    "Fresh Strawberry Mint Salad": "Fresh Strawberry Mint Salad",
    "Roasted Sweet Potato & Lentil Salad": "Roasted Sweet Potato & Lentil Salad",
    "Spring Salad": "Spring Salad",
    "Badrijani Nigvzit (Walnut Eggplant Rolls)": "Badrijani Nigvzit (Walnut Eggplant Rolls)",
    "Wild Mushroom Khinkali (4 pcs)": "Wild Mushroom Khinkali (4 pcs)",
    "Traditional Lobio in Clay Pot": "Traditional Lobio in Clay Pot",
    "Wild Berry Chia Pudding": "Wild Berry Chia Pudding",
    "Artisanal Grape Pelamushi Tart": "Artisanal Grape Pelamushi Tart",
  },

  uk: {
    // Navigation
    "Green by nature, Georgian by heart.": "Зелений за природою, грузинський за серцем.",
    "Seasonal bowls • Vegan friendly • Tbilisi": "Сезонні боули • Веганське меню • Тбілісі",
    "Most Popular Dishes": "Найпопулярніші страви",
    "Locations": "Локації",
    "View Menu": "Переглянути меню",
    "Price: Low to high": "Ціна: від низької",
    "Price: High to low": "Ціна: від високої",
    "Recommended": "Рекомендовані",
    "Main page": "Головна",
    "Book a Table": "Забронювати стіл",
    "Reservations": "Бронювання",
    "Menu": "Меню",
    "Reports": "Звіти",
    "Sign In": "Увійти",
    "Sign Out": "Вийти",
    "My Profile": "Мій профіль",
    "Cart": "Кошик",
    "Notifications": "Сповіщення",
    "Language": "Мова",

    // Common UI
    "Sort by:": "Сортувати за:",
    "Date / Time (Earliest first)": "Дата / Час (спочатку найближчі)",
    "Date / Time (Latest first)": "Дата / Час (спочатку пізніші)",
    "Guests (High to Low)": "Гості (від більшого)",
    "Guests (Low to High)": "Гості (від меншого)",
    "Restaurant (A to Z)": "Ресторан (А – Я)",
    "Restaurant (Z to A)": "Ресторан (Я – А)",
    "Book a table": "Забронювати стіл",
    "Find a Table": "Знайти стіл",
    "Pre-Order": "Передзамовлення",
    "Pre-order": "Передзамовлення",
    "All dishes": "Усі страви",
    "Popular Dishes": "Популярні страви",
    "Our Locations": "Наші локації",
    "Customer Reviews": "Відгуки клієнтів",
    "Atmosphere": "Атмосфера",
    "View menu": "Переглянути меню",
    "Hello,": "Привіт,",
    "No new notifications": "Немає нових сповіщень",
    "Please wait while we load your reservations.": "Будь ласка, зачекайте, поки ми завантажуємо ваші бронювання.",
    "It looks like you don't have any reservations.": "Схоже, у вас немає бронювань.",
    "Daily occupancy:": "Щоденна завантаженість:",
    "tables": "столів",
    "table": "стіл",
    "people": "осіб",
    "person": "особа",
    "Reserved": "Заброньовано",
    "Cancelled": "Скасовано",
    "In Progress": "В процесі",
    "Finished": "Завершено",
    "Calories:": "Калорії:",
    "Protein:": "Білки:",
    "Fats:": "Жири:",
    "Carbs:": "Вуглеводи:",
    "Vitamins & minerals:": "Вітаміни та мінерали:",

    // Categories
    "Appetizers": "Закуски",
    "Main Courses": "Основні страви",
    "MainCourse": "Основні страви",
    "Desserts": "Десерти",
    "Dessert": "Десерти",

    // Places / Locations Addresses
    "14 Baratashvili Street": "вул. Бараташвілі, 14",
    "9 Abashidze Street": "вул. Абашидзе, 9",
    "48 Rustaveli Avenue": "проспект Руставелі, 48",
    "24 Chavchavadze Avenue": "проспект Чавчавадзе, 24",
    "112 Agmashenebeli Avenue": "проспект Агмашенебелі, 112",
    "31 Pekini Avenue": "проспект Пекіні, 31",
    "7 Marjanishvili Street": "вул. Марджанішвілі, 7",
    "19 Vakhtang Gorgasali Street": "вул. Вахтанга Горгасалі, 19",

    // Places Descriptions
    "Nestled in the historic heart of Old Tbilisi near Gabriadze Clock Tower, this charming flagship location features warm terracotta brickwork, handcrafted oak furniture, and sun-dappled courtyard seating surrounded by blooming jasmine and ivy. Ideal for intimate morning breakfasts, leisurely weekend brunches, and relaxed gatherings with friends.":
      "Розташований в історичному серці Старого Тбілісі біля вежі театру Габріадзе, цей чарівний флагманський заклад вирізняється теплою теракотовою цеглою, меблями з дуба ручної роботи та затишним двориком, оточеним квітучим жасмином та плющем. Ідеально підходить для душевних сніданків, неспішних бранчів та теплих зустрічей з друзями.",
    "Located in the vibrant, upscale Vake district, our Abashidze Street venue features an airy greenhouse conservatory ceiling, polished travertine surfaces, and floor-to-ceiling glass looking out onto tree-lined neighborhood streets. Perfect for modern business lunches, family weekend dinners, and refreshing afternoon botanical coolers.":
      "Розташований у престижному районі Ваке, наш заклад на вулиці Абашидзе має скляну стелю оранжереї, полірований травертин та панорамні вікна з видом на затишну зелену вулицю. Чудово підходить для ділових обідів, сімейних вечерь та освіжаючих напоїв.",
    "Situated on Tbilisi's premier cultural boulevard directly opposite the Opera and Ballet Theatre, this grand high-ceilinged venue boasts classic arched windows, warm brass chandeliers, and an open show-kitchen counter. It offers an atmospheric pre-theatre dining experience with bespoke organic herbal teas and seasonal small plates.":
      "Знаходиться на головному культурному проспекті Тбілісі прямо навпроти Театру опери та балету. Цей величний простір із високими стелями, класичними арковими вікнами, латунними люстрами та відкритою кухнею створює вишукану атмосферу для вечері перед виставою за чашкою органічного чаю.",
    "Set along prestigious Chavchavadze Avenue, this contemporary dining space combines sleek minimalist elegance with warm wooden finishes and curated local art. With its open kitchen concept, cozy booth seating, and botanical mocktail and wine bar, it provides a sophisticated yet relaxed setting for evening dining and friendly get-togethers.":
      "Сучасний вишуканий ресторан на проспекті Чавчавадзе, де мінімалізм гармонійно поєднується з теплим деревом та картинами сучасних грузинських митців. Затишні кабінки, відкрита кухня та бар безалкогольних коктейлів створюють атмосферу невимушеної елегантності.",
    "Housed in a beautifully restored 19th-century building on pedestrian-friendly Agmashenebeli Avenue, this lively loft-style venue features high ceilings, exposed brick walls, and abundant natural light. The inviting indoor conservatory and street-side patio offer a vibrant, creative atmosphere for coffee meetups, remote work lunches, and shared plant-based feasts.":
      "Розташований у відреставрованій будівлі XIX століття на пішохідній частині проспекту Агмашенебелі. Простір у стилі лофт з високими стелями, відкритою цегляною кладкою, терасою та оранжереєю наповнений природним світлом і творчою атмосферою.",
    "Perched in dynamic Saburtalo, our Pekini Avenue branch features a breezy, sunlit rooftop terrace and a serene, nature-inspired dining room. Designed as a calm urban oasis away from the busy avenue below, it welcomes guests with panoramic sunset views, comfortable lounge seating, and a refreshing, family-friendly ambiance.":
      "Затишний міський оазис у динамічному Сабуртало. Локація на проспекті Пекіні пропонує сонячну терасу на даху з мальовничими видами на захід сонця та спокійну залу, створену для сімейного відпочинку далеко від метушні.",
    "Steps away from historic Marjanishvili Theatre, this elegant cultural-quarter restaurant pairs Art Nouveau architectural details with lush hanging botanicals and warm brass lighting. Guests enjoy an intimate, bohemian atmosphere ideal for pre-theatre dinners, artisanal dessert tastings, and relaxed conversations over organic Georgian herbal infusions.":
      "Всього за кілька кроків від театру Марджанішвілі, цей заклад у стилі модерн поєднує вишукану архітектуру, живі рослини та м'яке тепле освітлення. Богемна атмосфера ідеальна для дегустації авторських десертів та трав'яних чаїв.",
    "Overlooking the scenic Mtkvari riverfront in historic Abanotubani, our Gorgasali Street location offers breathtaking views of Narikala Fortress and the sulfur bath domes. Crafted with natural terracotta, reclaimed Georgian walnut wood, and a breezy riverside balcony, it delivers a soulful, unforgettable setting for sunset dining.":
      "З видом на набережну річки Мткварі в історичному районі Абанотубані. З балкона відкривається захоплюючий краєвид на фортецю Нарікала та куполи сірчаних лазень. Теракота, кавказький горіх та свіжий річковий бриз створюють неповторні враження.",

    // Dishes Names
    "Avocado & Pine Nut Bowl": "Боул з авокадо та кедровими горіхами",
    "Fresh Strawberry Mint Salad": "Свіжий салат з полуницею та м'ятою",
    "Roasted Sweet Potato & Lentil Salad": "Салат із запеченим бататом та сочевицею",
    "Spring Salad": "Весняний салат",
    "Badrijani Nigvzit (Walnut Eggplant Rolls)": "Бадріджані нігвзіт (баклажанові рулетики з горіхами)",
    "Wild Mushroom Khinkali (4 pcs)": "Хінкалі з дикими грибами (4 шт)",
    "Traditional Lobio in Clay Pot": "Традиційне лобіо в глиняному горщику",
    "Wild Berry Chia Pudding": "Чіа-пудинг з лісовими ягодами",
    "Artisanal Grape Pelamushi Tart": "Крафтовий виноградний тарт пеламуші",

    // Dishes Descriptions
    "Fresh avocado, roasted pine nuts, organic quinoa, cherry tomatoes, and lemon tahini dressing.":
      "Свіже авокадо, обсмажені кедрові горіхи, органічне кіноа, томати чері та лимонно-тахінна заправка.",
    "Strawberries, spinach, mint leaves, feta or goat cheese, walnuts, balsamic glaze, poppy seeds.":
      "Свіжа полуниця, бейбі-шпинат, листя м'яти, козячий сир або фета, волоські горіхи, бальзамічний крем та насіння маку.",
    "Warm spiced sweet potatoes, French green lentils, pomegranate seeds, and creamy cashew dressing.":
      "Теплий пряний батат, французька зелена сочевиця, соковиті зерна граната та ніжна заправка з кеш'ю.",
    "Crisp cucumber, fresh radishes, wild dill, scallions, sunflower seeds, and cold-pressed Kakhetian oil.":
      "Хрусткий огірок, свіжа редиска, польовий кріп, зелена цибуля, насіння соняшнику та запашна кахетинська олія холодного віджиму.",
    "Tender grilled eggplant slices filled with seasoned garlic walnut paste and topped with pomegranate seeds.":
      "Ніжні обсмажені слайси баклажанів, наповнені пряною пастою з волоських горіхів з часником, прикрашені зернами граната.",
    "Traditional Georgian dumplings handmade with seasoned wild mountain mushrooms, fresh herbs, and spicy broth.":
      "Традиційні грузинські хінкалі ручної ліпки з начинкою з ароматних гірських грибів, свіжої зелені та пікантного бульйону.",
    "Slow-cooked red kidney beans with coriander, savory, blue fenugreek, served with cornbread mchadi and pickles.":
      "Томлена червона квасоля з кінзою, чабером, блакитним пажитником, подається з гарячим кукурудзяним хлібом мчаді та соліннями.",
    "Organic chia seeds soaked in almond milk, layered with Georgian mountain raspberry coulis and fresh mint.":
      "Органічне насіння чіа на мигдалевому молоці з шарами кулі з гірської малини та свіжою м'ятою.",
    "Delicate almond crust filled with natural Saperavi grape juice pudding and topped with crushed walnuts.":
      "Тонка мигдалева основа з ніжним пудингом із натурального виноградного соку Сапераві та підсушеними волоськими горіхами.",
  },

  ka: {
    // Navigation
    "Green by nature, Georgian by heart.": "ბუნებით მწვანე, გულით ქართული.",
    "Seasonal bowls • Vegan friendly • Tbilisi": "სეზონური ბოულები • ვეგანური • თბილისი",
    "Most Popular Dishes": "ყველაზე პოპულარული კერძები",
    "Locations": "ლოკაციები",
    "View Menu": "მენიუს ნახვა",
    "Price: Low to high": "ფასი: ზრდადობით",
    "Price: High to low": "ფასი: კლებადობით",
    "Recommended": "რეკომენდებული",
    "Main page": "მთავარი",
    "Book a Table": "მაგიდის დაჯავშნა",
    "Reservations": "ჯავშნები",
    "Menu": "მენიუ",
    "Reports": "ანგარიშები",
    "Sign In": "შესვლა",
    "Sign Out": "გასვლა",
    "My Profile": "ჩემი პროფილი",
    "Cart": "კალათა",
    "Notifications": "შეტყობინებები",
    "Language": "ენა",

    // Common UI
    "Sort by:": "დახარისხება:",
    "Date / Time (Earliest first)": "თარიღი / დრო (უახლოესი)",
    "Date / Time (Latest first)": "თარიღი / დრო (უგვიანესი)",
    "Guests (High to Low)": "სტუმრები (კლებადობით)",
    "Guests (Low to High)": "სტუმრები (ზრდადობით)",
    "Restaurant (A to Z)": "რესტორანი (ა – ჰ)",
    "Restaurant (Z to A)": "რესტორანი (ჰ – ა)",
    "Book a table": "მაგიდის დაჯავშნა",
    "Find a Table": "მაგიდის მოძებნა",
    "Pre-Order": "წინასწარი შეკვეთა",
    "Pre-order": "წინასწარი შეკვეთა",
    "All dishes": "ყველა კერძი",
    "Popular Dishes": "პოპულარული კერძები",
    "Our Locations": "ჩვენი ლოკაციები",
    "Customer Reviews": "მომხმარებელთა შეფასებები",
    "Atmosphere": "ატმოსფერო",
    "View menu": "მენიუს ნახვა",
    "Hello,": "გამარჯობა,",
    "No new notifications": "ახალი შეტყობინებები არ არის",
    "Please wait while we load your reservations.": "გთხოვთ მოიცადოთ, სანამ თქვენი ჯავშნები ჩაიტვირთება.",
    "It looks like you don't have any reservations.": "როგორც ჩანს, ჯავშნები არ გაქვთ.",
    "Daily occupancy:": "დღიური დატვირთვა:",
    "tables": "მაგიდა",
    "table": "მაგიდა",
    "people": "სტუმარი",
    "person": "სტუმარი",
    "Reserved": "დაჯავშნილია",
    "Cancelled": "გაუქმებულია",
    "In Progress": "მიმდინარეობს",
    "Finished": "დასრულებულია",
    "Calories:": "კალორიები:",
    "Protein:": "ცილები:",
    "Fats:": "ცხიმები:",
    "Carbs:": "ნახშირწყლები:",
    "Vitamins & minerals:": "ვიტამინები და მინერალები:",

    // Categories
    "Appetizers": "აპეტაიზერები",
    "Main Courses": "ძირითადი კერძები",
    "MainCourse": "ძირითადი კერძები",
    "Desserts": "დესერტები",
    "Dessert": "დესერტები",

    // Places / Locations Addresses
    "14 Baratashvili Street": "ბარათაშვილის ქუჩა 14",
    "9 Abashidze Street": "აბაშიძის ქუჩა 9",
    "48 Rustaveli Avenue": "რუსთაველის გამზირი 48",
    "24 Chavchavadze Avenue": "ჭავჭავაძის გამზირი 24",
    "112 Agmashenebeli Avenue": "აღმაშენებლის გამზირი 112",
    "31 Pekini Avenue": "პეკინის გამზირი 31",
    "7 Marjanishvili Street": "მარჯანიშვილის ქუჩა 7",
    "19 Vakhtang Gorgasali Street": "ვახტანგ გორგასლის ქუჩა 19",

    // Places Descriptions
    "Nestled in the historic heart of Old Tbilisi near Gabriadze Clock Tower, this charming flagship location features warm terracotta brickwork, handcrafted oak furniture, and sun-dappled courtyard seating surrounded by blooming jasmine and ivy. Ideal for intimate morning breakfasts, leisurely weekend brunches, and relaxed gatherings with friends.":
      "ძველი თბილისის ისტორიულ გულში, გაბრიაძის კოშკთან მდებარე ჩვენი მთავარი რესტორანი გამოირჩევა თბილი ტერაკოტის აგურით, მუხის ხელნაკეთი ავეჯითა და მყუდრო ეზოთი. იდეალურია სასიამოვნო საუზმისთვის, შაბათ-კვირის ბრანჩისა და მეგობრული შეხვედრებისთვის.",
    "Located in the vibrant, upscale Vake district, our Abashidze Street venue features an airy greenhouse conservatory ceiling, polished travertine surfaces, and floor-to-ceiling glass looking out onto tree-lined neighborhood streets. Perfect for modern business lunches, family weekend dinners, and refreshing afternoon botanical coolers.":
      "ვაკის პრესტიჟულ უბანში მდებარე აბაშიძის ფილიალი გამორჩეულია ორანჟერეის სტილის ჭერით, ტრავერტინის ზედაპირითა და პანორამული ხედებით გამწვანებულ ქუჩაზე. იდეალურია საქმიანი ლანჩისა და ოჯახური სადილისთვის.",
    "Situated on Tbilisi's premier cultural boulevard directly opposite the Opera and Ballet Theatre, this grand high-ceilinged venue boasts classic arched windows, warm brass chandeliers, and an open show-kitchen counter. It offers an atmospheric pre-theatre dining experience with bespoke organic herbal teas and seasonal small plates.":
      "რუსთაველის გამზირზე, ოპერისა და ბალეტის თეატრის პირდაპირ მდებარე ეს სივრცე ხიბლავს მაღალი ჭერით, თაღოვანი ფანჯრებითა და ღია სამზარეულოთი. გთავაზობთ თეატრისწინა საუკეთესო ატმოსფეროს ორგანული ჩაითა და სეზონური კერძებით.",
    "Set along prestigious Chavchavadze Avenue, this contemporary dining space combines sleek minimalist elegance with warm wooden finishes and curated local art. With its open kitchen concept, cozy booth seating, and botanical mocktail and wine bar, it provides a sophisticated yet relaxed setting for evening dining and friendly get-togethers.":
      "ჭავჭავაძის გამზირზე მდებარე თანამედროვე რესტორანი აერთიანებს ელეგანტურ მინიმალიზმსა და ხის თბილ დეტალებს. მყუდრო კუთხეები და ბოტანიკური კოქტეილების ბარი საუკეთესო გარემოს ქმნის საღამოს ვახშმისთვის.",
    "Housed in a beautifully restored 19th-century building on pedestrian-friendly Agmashenebeli Avenue, this lively loft-style venue features high ceilings, exposed brick walls, and abundant natural light. The inviting indoor conservatory and street-side patio offer a vibrant, creative atmosphere for coffee meetups, remote work lunches, and shared plant-based feasts.":
      "აღმაშენებლის საფეხმავლო გამზირზე, XIX საუკუნის ისტორიულ შენობაში განთავსებული ლოფტის სტილის სივრცე სავსეა ბუნებრივი სინათლით. შიდა ორანჟერეა და ღია ტერასა შემოქმედებით და ცოცხალ გარემოს ქმნის.",
    "Perched in dynamic Saburtalo, our Pekini Avenue branch features a breezy, sunlit rooftop terrace and a serene, nature-inspired dining room. Designed as a calm urban oasis away from the busy avenue below, it welcomes guests with panoramic sunset views, comfortable lounge seating, and a refreshing, family-friendly ambiance.":
      "საბურთალოს ცენტრში, პეკინის გამზირზე მდებარე ფილიალი გთავაზობთ მზიან ღია ტერასას სახურავზე მზის ჩასვლის პანორამული ხედებით. ნამდვილი ქალაქური ოაზისი ოჯახური დასვენებისთვის.",
    "Steps away from historic Marjanishvili Theatre, this elegant cultural-quarter restaurant pairs Art Nouveau architectural details with lush hanging botanicals and warm brass lighting. Guests enjoy an intimate, bohemian atmosphere ideal for pre-theatre dinners, artisanal dessert tastings, and relaxed conversations over organic Georgian herbal infusions.":
      "მარჯანიშვილის თეატრთან ახლოს, მოდერნის სტილის ეს ელეგანტური რესტორანი აერთიანებს მწვანე მცენარეებსა და მყუდრო განათებას. ბოჰემური ატმოსფერო საუკეთესოა ხელნაკეთი დესერტებისა და ჩაის დასაგემოვნებლად.",
    "Overlooking the scenic Mtkvari riverfront in historic Abanotubani, our Gorgasali Street location offers breathtaking views of Narikala Fortress and the sulfur bath domes. Crafted with natural terracotta, reclaimed Georgian walnut wood, and a breezy riverside balcony, it delivers a soulful, unforgettable setting for sunset dining.":
      "აბანოთუბანში, მტკვრის სანაპიროზე მდებარე რესტორნიდან იშლება ნარიყალას ციხესიმაგრისა და გოგირდის აბანოების თვალწარმტაცი ხედები. კავკასიური კაკლის ხე და მდინარის ნიავი დაუვიწყარ შთაბეჭდილებას ტოვებს.",

    // Dishes Names
    "Avocado & Pine Nut Bowl": "ავოკადოსა და ფიჭვის კაკლის ბოული",
    "Fresh Strawberry Mint Salad": "მარწყვისა და პიტნის ცოცხალი სალათი",
    "Roasted Sweet Potato & Lentil Salad": "შემწვარი ტკბილი კარტოფილისა და ოსპის სალათი",
    "Spring Salad": "გაზაფხულის სალათი",
    "Badrijani Nigvzit (Walnut Eggplant Rolls)": "ბადრიჯანი ნიგვზით",
    "Wild Mushroom Khinkali (4 pcs)": "ტყის სოკოს ხინკალი (4 ც)",
    "Traditional Lobio in Clay Pot": "ტრადიციული ლობიო თიხის ქოთანში",
    "Wild Berry Chia Pudding": "ტყის კენკრის ჩია პუდინგი",
    "Artisanal Grape Pelamushi Tart": "ფელამუშის ყურძნის ხელნაკეთი ტარტი",

    // Dishes Descriptions
    "Fresh avocado, roasted pine nuts, organic quinoa, cherry tomatoes, and lemon tahini dressing.":
      "ახალი ავოკადო, მოხალული ფიჭვის კაკალი, ორგანული კინოა, ჩერი პომიდორი და ლიმონიანი ტაჰინის დრესინგი.",
    "Strawberries, spinach, mint leaves, feta or goat cheese, walnuts, balsamic glaze, poppy seeds.":
      "მარწყვი, ისპანახი, პიტნის ფოთლები, თხის ყველი ან ფეტა, ნიგოზი, ბალზამიკოს კრემი და ყაყაჩოს თესლი.",
    "Warm spiced sweet potatoes, French green lentils, pomegranate seeds, and creamy cashew dressing.":
      "თბილი სანელებლებით შეზავებული ტკბილი კარტოფილი, ფრანგული მწვანე ოსპი, ბროწეულის მარცვლები და კეფირივით ნაზი კეშიუს დრესინგი.",
    "Crisp cucumber, fresh radishes, wild dill, scallions, sunflower seeds, and cold-pressed Kakhetian oil.":
      "ხრაშუნა კიტრი, ბოლოკი, კამა, მწვანე ხახვი, მზესუმზირის მარცვლები და კახური ცივად დაწურული ზეთი.",
    "Tender grilled eggplant slices filled with seasoned garlic walnut paste and topped with pomegranate seeds.":
      "გრილზე შემწვარი ბადრიჯანი ნიგვზით, ნივრით, სანელებლებითა და ბროწეულის მარცვლებით.",
    "Traditional Georgian dumplings handmade with seasoned wild mountain mushrooms, fresh herbs, and spicy broth.":
      "ხელნაკეთი ხინკალი ტყის სოკოს, მთის მწვანილებისა და ცხარე ბულიონის არომატული გულსართით.",
    "Slow-cooked red kidney beans with coriander, savory, blue fenugreek, served with cornbread mchadi and pickles.":
      "თიხის ქოთანში ნელ-ნელა მოხარშული წითელი ლობიო ქინძით, ქონდრითა და უცხო სუნელით, მჭადთან და მწნილთან ერთად.",
    "Organic chia seeds soaked in almond milk, layered with Georgian mountain raspberry coulis and fresh mint.":
      "ნუშის რძეში დამბალი ორგანული ჩიას თესლი მთის ჟოლოს კულის ფენებითა და ცოცხალი პიტნით.",
    "Delicate almond crust filled with natural Saperavi grape juice pudding and topped with crushed walnuts.":
      "ნუშის ნაზი ცომის ტარტი ბუნებრივი საფერავის ბადაგისგან დამზადებული ფელამუშითა და დაქუცმაცებული ნიგვზით.",
  },
};
