# EPAM IT Marathon 6.0 — Комплексний посібник з домашнього завдання (All-in-One Guide)

> **Про проєкт:** **Green & Tasty** — хмарна ресторанна платформа (full-stack serverless застосунок) для онлайн-бронювання столиків, замовлення страв і колективного вибору меню.  
> Цей документ об'єднує вимоги, специфікації та покрокові інструкції для всіх напрямів: **Frontend**, **Backend**, **Test Automation (AQA)** та **DevOps / Cloud Deployment**.

---

## Зміст

1. [Загальний огляд фічі: Group Pre-Order](#1-загальний-огляд-фічі-group-pre-order)
2. [Архітектура та технологічний стек](#2-архітектура-та-технологічний-стек)
3. [Швидкий старт для розробки](#3-швидкий-старт-для-розробки)
4. [Трек Frontend: покрокові інструкції](#4-трек-frontend-покрокові-інструкції)
   - [Практичне завдання (~15 хв)](#практичне-завдання-15-хв)
   - [Рівень 1: Верстка та стилізація Owner Review](#рівень-1-верстка-та-стилізація-owner-review)
   - [Рівень 2: Груповий pre-order на моках](#рівень-2-груповий-pre-order-на-моках)
   - [Рівень 3: Інтеграція з реальним API та синхронізація](#рівень-3-інтеграція-з-реальним-api-та-синхронізація)
   - [Рівень 3 (Бонус): Видалення гостя (Remove Guest)](#рівень-3-бонус-видалення-гостя-remove-guest)
5. [Трек Backend: покрокові інструкції](#5-трек-backend-покрокові-інструкції)
   - [Рівень 1: Отримання сесій учасників](#рівень-1-отримання-сесій-учасників)
   - [Рівень 2: Отримання Owner Session ID та консолідований Submit](#рівень-2-отримання-owner-session-id-та-консолідований-submit)
   - [Рівень 3: Видалення сесії учасника з групи](#рівень-3-видалення-сесії-учасника-з-групи)
6. [Трек Test Automation (AQA): покрокові інструкції](#6-трек-test-automation-aqa-покрокові-інструкції)
   - [Вибір напряму тестування](#вибір-напряму-тестування)
   - [Напрям 1: Груповий pre-order (Рівні 1–3)](#напрям-1-груповий-pre-order-рівні-13)
   - [Напрям 2: Наявний функціонал застосунку (Рівні 1–3)](#напрям-2-наявний-функціонал-застосунку-рівні-13)
   - [Завдання з зірочкою (ReportPortal & CI)](#завдання-з-зірочкою-reportportal--ci)
7. [Трек DevOps та розгортання в AWS](#7-трек-devops-та-розгортання-в-aws)
8. [Чек-лист перевірок перед здачею](#8-чек-лист-перевірок-перед-здачею)

---

## 1. Загальний огляд фічі: Group Pre-Order

Головна фіча домашнього завдання марафону — **групове попереднє замовлення страв (Group Pre-Order)**:
1. Клієнт створює бронювання столика на кілька гостей і стає **Owner** (власником) бронювання.
2. Owner генерує посилання із запрошенням (`Invite Link`: `/join/:token`), яке відправляє друзям (гостям).
3. Кожен гість заходить за посиланням, вказує своє ім'я, обирає страви з меню ресторану у свій кошик і підтверджує його (`Submit Cart`).
4. Owner також додає власні страви у своїй сесії (**My Pre-Order**).
5. На екрані огляду (`/reservations/:id/group-order`) Owner бачить:
   - картки всіх гостей та їхні замовлення;
   - хто вже підтвердив вибір, а хто ще обирає;
   - суми по кожному гостю та підсумкову консолідовану суму замовлення.
6. Owner може видалити учасника, якщо той відмовився або не визначився.
7. Після завершення збору Owner натискає **Submit Pre-Order**:
   - страви лише підтверджених учасників об'єднуються в один консолідований список (однакові позиції групуються по кількості);
   - єдине замовлення передається кухні ресторану зі статусом `SubmittedByCustomer`;
   - статус групового бронювання переходить у `Submitted`, а інтерфейс перемикається в режим перегляду (read-only).

---

## 2. Архітектура та технологічний стек

```
┌────────────────────────────────────────────────────────┐
│               Frontend: Angular 22                     │
│  Standalone components • Signals • SCSS • Mocks / Real │
└───────────────────────────▲────────────────────────────┘
                            │ HTTP (REST)
┌───────────────────────────▼────────────────────────────┐
│              Amazon API Gateway (REST API)             │
└───────────────────────────▲────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│      AWS Lambda Functions (.NET 10 / C# Serverless)    │
│  • api-handler    • reports-handler   • report-sender  │
└──────────────┬────────────────────────────┬────────────┘
               │                            │
┌──────────────▼────────────┐ ┌─────────────▼────────────┐
│   Amazon DynamoDB         │ │       Amazon S3          │
│ Dishes, Orders, Sessions, │ │ Web hosting, images,     │
│ Reservations, Aggregates  │ │ reports, tf-state        │
└───────────────────────────┘ └──────────────────────────┘
```

* **Frontend:** `frontend/restaurant-frontend-app/` — Angular 22 (signals, computed, standalone components, lazy loading, TypeScript strict mode).
* **Backend:** `backend/restaurant-backend-app/` — .NET 10 Lambdas під керуванням AWS Syndicate (`api-handler`, `report-sender`, `reports-handler`).
* **DevOps / IaC:** `infra/terraform/` — Terraform маніфести для S3, CloudFront, Cognito, EventBridge, CloudWatch Dashboard & Alarms.
* **AQA:** `aqa/restaurant-aqa-framework/` — C# .NET 10, Reqnroll (BDD), Playwright для UI, Screenplay Pattern, RestSharp / HttpClient для API.

---

## 3. Швидкий старт для розробки

### Варіант А: Локальний старт Frontend (Рівні 1–2, без бекенду)
У проєкті вже налаштовано мок-автентифікацію та мок-сервер для демо-бронювання.

```bash
cd frontend/restaurant-frontend-app
npm ci
npm start
```
Відкрийте в браузері:
```
http://localhost:4200/reservations/demo-reservation/group-order?demo
```
> `?demo` автоматично логінить вас як Owner демо-бронювання без потреби у підключенні бази даних чи AWS Cognito.

### Варіант Б: Запуск тестів домашнього завдання Frontend
```bash
cd frontend/restaurant-frontend-app
npm run test:hw
```

### Варіант В: Запуск тестів AQA
```bash
cd aqa/restaurant-aqa-framework
cp .env.example .env
# Заповніть адресу та облікові записи у .env
dotnet test
```

---

## 4. Трек Frontend: покрокові інструкції

Всі шляхи вказуються відносно `frontend/restaurant-frontend-app/src/app/`.

### Практичне завдання (~15 хв)
Мета: Створити перший робочий компонент картки учасника та сторінку списку на тестових даних.

1. **Скопіюйте тести практичного:**
   ```bash
   cd frontend/restaurant-frontend-app
   cp -R homework-tests/practice/. src/app/
   npm run test:hw
   ```
2. **Створіть компонент картки** `components/group-orders/participant-card/participant-card.component.ts`:
   - `@Component` з `changeDetection: ChangeDetectionStrategy.Eager`
   - `readonly participant = input.required<Participant>()`
   - `readonly title = computed(() => ...)`: "Owner: {name}" або "Guest: {name}"
3. **Створіть сторінку** `pages/group-order-page/group-order-page.component.ts`:
   - `participants = signal(GROUP_ORDER_PREVIEW.sessions.participants)`
   - Вивід списку через `@for (person of participants(); track person.id)`
4. **Зареєструйте маршрут** в `app.routes.ts`:
   ```ts
   {
     path: 'reservations/:reservationId/group-order',
     canActivate: [AuthGuard],
     data: { authorized: true },
     loadComponent: () =>
       import('./pages/group-order-page/group-order-page.component').then((m) => m.GroupOrderPageComponent),
   }
   ```
5. **Додайте страви та ціни в картку:**
   - Список страв через `CurrencyPipe`: назва, кількість `× Qty`, ціна за позицію, фото (`width="40" height="40" loading="lazy"`), плейсхолдер першої літери при відсутності фото.
   - Відображення `Subtotal` кошика гостя.
   - Текстовий статус: `<span class="chip submitted">Submitted</span>` або `<span class="chip pending">Still choosing</span>`.
6. Перевірте проходження 8 тестів: `npm run test:hw`.

---

### Рівень 1: Верстка та стилізація Owner Review
Мета: Довести сторінку до макета Figma (`homework/homework-design/01-owner-review.png`) на статичних даних.

1. **Скопіюйте тести рівня 1:**
   ```bash
   cp -R homework-tests/level-1/. src/app/
   npm run test:hw
   ```
2. **Додайте шапку екрана:**
   - Назва локації, адреса, дата і час (`StartTime`, `EndTime` відформатовані пайпом `date`).
   - Кількість гостей: `"4 of 5 guests"`.
3. **Блок Grand Total:**
   - Загальна сума з `GROUP_ORDER_PREVIEW.sessions.total` через пайп `currency`.
4. **Стилізація за макетом:**
   - Використовуйте дизайн-токени `@use 'app/shared/styles/abstracts/colors' as color;`.
   - Семантичний HTML (`<main>`, єдиний `<h1>`, `<ul>`/`<li>`, `<article>`).
   - Адаптивність: екран коректно виглядає на мобільних екранах (від 375px).
   - Статус кошика обов'язково передається текстом, а не тільки кольором.
5. Перевірте, що всі тести практичного і рівня 1 зелені: `npm run test:hw`.

---

### Рівень 2: Груповий pre-order на моках
Мета: Реалізувати бізнес-логіку підтвердження замовлення з використанням мок-бекенду.

1. **Скопіюйте тести рівня 2** (вони замінять тест сторінки рівня 1):
   ```bash
   cp -R homework-tests/level-2/. src/app/
   ```
2. **Створіть сервіс `GroupOrdersService`** (`services/group-orders/group-orders.service.ts`):
   - `getSessions(groupReservationId: string)`
   - `getGuestSessionId(reservationId: string)`
   - `getStatus(groupReservationId: string)`
   - `submitGroupPreOrder(groupReservationId: string, reservationId: string)`
3. **Підключіть реальний стан через Signals на сторінці:**
   - Отримання `reservationId` з `ActivatedRoute`.
   - Завантаження сесій та статусу.
   - Власна картка Owner виділяється написом **My Pre-Order** (`participant.id === guestSessionId`).
4. **Розрахунок консолідованого замовлення:**
   - `consolidated = computed(() => consolidatePreOrder(participants()))`.
   - **Grand Total дорівнює сумі консолідованого замовлення** (враховуються лише підтверджені кошики зі статусом `isSubmitted: true`).
5. **UI-елементи взаємодії:**
   - Попереджувальна жовта плашка при наявності непідтверджених гостей:  
     `"N participants haven't submitted their cart yet — their dishes won't be included in the order"`.
   - Бейдж статусу: `Collecting pre-orders` (для Open) або `Sent to Restaurant` (для Submitted).
   - Кнопка **Submit Pre-Order** (заблокована, якщо немає підтверджених страв або триває запит).
   - Діалогове вікно підтвердження `<app-modal>` з кнопками «Submit» та «Cancel».
   - Після submit: toast-повідомлення «Pre-order sent to the restaurant» і перемикання екрана в read-only режим (`02-sent-to-restaurant.png`).
6. Перевірте проходження всіх тестів рівня 2: `npm run test:hw`.

---

### Рівень 3: Інтеграція з реальним API та синхронізація
Мета: Робота зі справжнім AWS API Gateway бекендом, динамічний polling змін від гостей.

1. **Скопіюйте тести рівня 3:**
   ```bash
   cp -R homework-tests/level-3/. src/app/
   ```
2. **Налаштуйте адресу бекенду:**
   У `src/environments/environment.development.ts` вкажіть ваш `backendUrl`.
3. **Фонова синхронізація:**
   - Поки група має статус `Open`, оновлюйте кошики кожні 15 секунд (`interval(15000)` / `exhaustMap`).
   - Фонове оновлення не блокує екран глобальним spinner'ом.
   - Відображайте час останнього оновлення: `"Updated at HH:mm:ss"` та кнопку **Refresh**.
   - При невдалому запиті не спамити toast-повідомленнями (передавайте `SKIP_ERROR_TOAST`).
   - При переході зі сторінки або після Submit таймер обов'язково знищується.
4. Перевірте тести синхронізації: `npm run test:hw`.

---

### Рівень 3 (Бонус): Видалення гостя (Remove Guest)
1. **Скопіюйте тести бонусу:**
   ```bash
   cp -R homework-tests/level-3-bonus/. src/app/
   ```
2. **Реалізація:**
   - Кнопка **Remove Guest** на картках гостей (`type === 'Guest'`), відсутня у Owner та після submit.
   - Модальне вікно підтвердження: `"Are you sure you want to remove {Name} and their pre-order...?"`.
   - Виклик `DELETE /guest/groups/{groupReservationId}/sessions/{guestSessionId}`.
   - Оновлення списку учасників та сум з відповіді сервера.
   - Доступність: `aria-label="Remove {Name}"`.

---

## 5. Трек Backend: покрокові інструкції

Всі зміни реалізуються у `backend/restaurant-backend-app/` у проєкті `APIHandler` (.NET 10 AWS Lambda).

### Рівень 1: Отримання сесій учасників

**Ендпоінт:** `GET /guest/groups/{groupReservationId}/sessions`  
**Авторизація:** Тільки **Owner** бронювання (перевірка `userId` із токена).

**Формат відповіді (200 OK):**
```json
{
  "participants": [
    {
      "id": "session-id-1",
      "type": "Guest",
      "name": "Andrii",
      "items": [
        {
          "dish": {
            "id": "dish-1",
            "name": "Caesar Salad",
            "price": 180
          },
          "quantity": 2
        }
      ],
      "total": 360,
      "isSubmitted": true
    }
  ],
  "total": 360
}
```

---

### Рівень 2: Отримання Owner Session ID та консолідований Submit

#### 1. Отримати власну сесію Owner
**Ендпоінт:** `GET /reservations/{reservationId}/guest-session-id`  
**Відповідь (200 OK):**
```json
{
  "guestSessionId": "owner-session-guid"
}
```

#### 2. Підтвердити консолідований pre-order
**Ендпоінт:** `POST /group-reservations/{groupReservationId}/submit`  
**Request Body:**
```json
{
  "reservationId": "reservation-id-123"
}
```
**Логіка обробки:**
1. Перевірити, що запит робить Owner.
2. Якщо reservation або group reservation не знайдено — повернути `404 Not Found`.
3. Відфільтрувати сесії: брати лише `isSubmitted == true`.
4. Якщо немає жодної підтвердженої сесії або в них немає страв — повернути `400 Bad Request`.
5. Згрупувати страви: об'єднати позиції з однаковим `dishId`, склавши їхні кількості.
6. Оновити Order ресторану зі списком консолідованих страв, встановити статус `SubmittedByCustomer`.
7. Оновити статус GroupReservation на `Submitted`.

**Відповідь (200 OK):**
```json
[
  {
    "dishId": "dish-1",
    "quantity": 3
  },
  {
    "dishId": "dish-2",
    "quantity": 1
  }
]
```

---

### Рівень 3: Видалення сесії учасника з групи

**Ендпоінт:** `DELETE /guest/groups/{groupReservationId}/sessions/{guestSessionId}`  
**Вимоги:**
- Тільки Owner має право видаляти учасника.
- Якщо сесія не знайдена — повернути `404 Not Found`.
- Якщо сесія належить іншій групі — повернути `400 Bad Request`.
- Видалити запис сесії з DynamoDB.
- Повернути оновлений об'єкт стану групи (такий самий, як у `GET /sessions`).

---

## 6. Трек Test Automation (AQA): покрокові інструкції

Проєкт тестів: `aqa/restaurant-aqa-framework/`.  
Паттерн: **Screenplay Pattern** + **Reqnroll (Gherkin BDD)** + **Playwright**.

### Вибір напряму тестування

| Що у вас розгорнуто | Що автоматизувати |
|---|---|
| Власний розгорнутий Backend + Frontend | **Напрям 1**: UI-тести консолідації + API-тести валідації та безпеки |
| Тільки розгорнутий Backend | **Напрям 1**: API-тести всіх рівнів + 1 мінімальний UI-тест |
| Оригінальний розгорнутий застосунок | **Напрям 2**: E2E тести наявного функціоналу |
| Публічний аналог (Booking, OpenTable) | **Напрям 2**: Сценарії на публічному сайті |

### Напрям 1: Груповий pre-order (Рівні 1–3)
* **Рівень 1 (Перегляд сесій):**
  - Owner створює групу, гості додають страви. Перевірити відображення списку, підсумків та статусів у UI.
  - API валідації: спроба перегляду не-Owner користувачем (403), неіснуюча група (404).
* **Рівень 2 (Консолідований Submit):**
  - Позитивний сценарій: submit успішний, однакові страви від різних гостей об'єднані, непідтверджені кошики виключені.
  - Перевірка, що офіціант бачить підтверджене замовлення ресторану.
  - Негативні тести (400): submit без страв, повторний submit, submit не від Owner.
* **Рівень 3 (Видалення учасника):**
  - Видалення гостя з групи через UI/API. Перерахунок суми.
  - Перевірка виключення видаленого гостя з фінального замовлення для офіціанта.
  - Негативні тести: видалення учасника іншої групи (400), видалення неіснуючого (404).

### Напрям 2: Наявний функціонал застосунку (Рівні 1–3)
* **Рівень 1:** Реєстрація (boundary value analysis для довжини полів), авторизація, фільтри та сортування меню ресторану.
* **Рівень 2:** Пошук вільного столика, бронювання (перевірка правила 15 хв, місткість, неперетинні інтервали), редагування та скасування.
* **Рівень 3:** Життєвий цикл замовлення офіціантом (підтвердження страв, зміна статусів стола), публікація та модерація відгуків.

### Завдання з зірочкою (ReportPortal & CI)
* Інтеграція вивантаження результатів у ReportPortal через Reqnroll хуки.
* Налаштування автоматичного запуску тестів у GitHub Actions (`.github/workflows/aqa-tests.yml`).

---

## 7. Трек DevOps та розгортання в AWS

1. **Інфраструктура (Terraform):**
   ```bash
   cd infra/terraform
   # Налаштуйте ваш AWS Account ID у variables.tf та backend.tf
   terraform init
   terraform plan
   terraform apply
   ```
2. **Бекенд (AWS Syndicate):**
   ```bash
   cd backend/restaurant-backend-app
   # Налаштуйте syndicate.yml та syndicate_aliases.yml
   syndicate build --bundle_name dev_bundle
   syndicate deploy --bundle_name dev_bundle
   ```
3. **Фронтенд (S3 + CloudFront):**
   ```bash
   cd frontend/restaurant-frontend-app
   BACKEND_URL=https://<api-gateway-id>.execute-api.<region>.amazonaws.com/develop npm run build
   aws s3 sync dist/restaurant-frontend-app/browser s3://<your-frontend-bucket> --delete
   ```

---

## 8. Чек-лист перевірок перед здачею

Перед фінальним комітом та відправкою роботи обов'язково виконайте перевірки:

### Frontend
```bash
cd frontend/restaurant-frontend-app
npx tsc -p tsconfig.app.json  --noEmit    # Перевірка компіляції застосунку
npx tsc -p tsconfig.spec.json --noEmit    # Перевірка компіляції тестів
BACKEND_URL=https://example.com npm run build # Успішний production білд
npm run test:hw                           # Всі тести домашки мають бути ЗЕЛЕНИМИ
```

### Backend
```bash
cd backend/restaurant-backend-app
dotnet build restaurant-backend-app.sln
dotnet test
```

### AQA
```bash
cd aqa/restaurant-aqa-framework
dotnet build
dotnet test --filter "TestCategory=Level1|TestCategory=Level2"
```
