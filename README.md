# Green & Tasty — EPAM IT Marathon 6.0

[![devs.surf](https://devs.surf/badges/subdomain.svg)](https://green-tasty.devs.surf)

Ласкаво просимо до об'єднаного репозиторію проєкту **Green & Tasty** в межах **EPAM IT Marathon 6.0**.  
Цей репозиторій містить повний стек застосунку:
* **Frontend:** Angular 22 клієнтський застосунок (`frontend/restaurant-frontend-app/`)
* **Backend:** Serverless мікросервіси на .NET 10 (C#) та AWS Lambda (`backend/restaurant-backend-app/`)
* **Infrastructure / DevOps:** Terraform маніфести та конфігурація AWS Syndicate (`infra/terraform/`)
* **Test Automation (AQA):** Фреймворк автоматизованого тестування на .NET 10 (Reqnroll BDD + Playwright + Screenplay) (`aqa/restaurant-aqa-framework/`)
* **CI/CD:** Пайплайни GitHub Actions (`.github/workflows/`)
* **User Stories & Business Analysis:** Scrum користувацькі історії за стандартами EPAM BA (`user-stories/`)
* **Homework & Design:** Усі інструкції, специфікації та дизайн-макети зібрано в папці `homework/`

---

## 🌐 Посилання на розгорнуті ресурси

| Компонент / Сервіс | Посилання | Опис |
| :--- | :--- | :--- |
| **Custom Domain (Devs.Surf)** | [green-tasty.devs.surf](https://green-tasty.devs.surf) | Кастомний домен клієнтського застосунку |
| **Frontend Application (S3)** | [restaurant-frontend-060913167510.s3-website.us-east-1.amazonaws.com](http://restaurant-frontend-060913167510.s3-website.us-east-1.amazonaws.com) | Головний клієнтський Angular-застосунок |
| **Owner Group Order (Live Demo)** | [demo-reservation/group-order?demo](https://green-tasty.devs.surf/reservations/demo-reservation/group-order?demo) | Інтерактивне демо групового замовлення Owner Flow (Рівні 1–3 + Remove Guest) |
| **Backend API Gateway** | [pin0yvpmgk.execute-api.us-east-1.amazonaws.com/develop](https://pin0yvpmgk.execute-api.us-east-1.amazonaws.com/develop) | Базовий REST API Gateway ендпоінт (`develop`) |
| **Swagger UI** | [restaurant-backend-dev-swagger-ui-060913167510.s3-website.us-east-1.amazonaws.com](http://restaurant-backend-dev-swagger-ui-060913167510.s3-website.us-east-1.amazonaws.com) | Інтерактивна документація API |

> [!TIP]
> **🚀 Live Demo посилання для перевірки виконання завдання Frontend:**  
> [https://green-tasty.devs.surf/reservations/demo-reservation/group-order?demo](https://green-tasty.devs.surf/reservations/demo-reservation/group-order?demo)  
> *Параметр `?demo` автоматично активує тестову сесію Owner без потреби у реєстрації.*

---

## 📋 Користувацькі історії (Scrum User Stories)

Всі користувацькі історії створюються відповідно до методології Scrum та вимог EPAM Business Analysis (*"Software requirements in Scrum: How to turn 'I want' into clear teamwork"*) із застосуванням INVEST-критеріїв, структурованих Pre-conditions та верифікованих Acceptance Criteria (AC).

Розробка ведеться за підтримки агента **Business Analyst** ([`.ai/agents/business-analyst.md`](.ai/agents/business-analyst.md)) та навички **Create User Story** ([`skills/create-user-story/`](skills/create-user-story/)):

| User Story | Назва та опис фічі | Епік | Статус |
|:---|:---|:---|:---:|
| [**`US0-group-pre-order-owner-review.md`**](user-stories/US0-group-pre-order-owner-review.md) | **Group Pre-Order Owner Review**: Консолідація та підтвердження замовлень учасників для ресторану | Pre-Order & Group Booking Management | ✅ Готово |
| [**`US1-sort-reservations.md`**](user-stories/US1-sort-reservations.md) | **Sort Reservations**: Дропдаун сортування на сторінці бронювань за датою/часом, кількістю гостей або рестораном | Reservation Management | ✅ Готово |
| [**`US2-internationalization.md`**](user-stories/US2-internationalization.md) | **Website Internationalization**: Багатомовність (English, Ukrainian, Georgian) з перекладом страв і локацій | Localization & Internationalization | ✅ Готово |

---

## 📚 Документація та домашні завдання

Вся документація та специфікації домашніх завдань знаходяться у директорії [`homework/`](homework/):

| Документ | Опис |
|---|---|
| [**`homework/homework-frontend.md`**](homework/homework-frontend.md) | Домашнє завдання з Frontend (3 рівні + бонус Remove Guest) |
| [**`homework/practice-frontend.md`**](homework/practice-frontend.md) | Практичне завдання Frontend на ~15 хв (створення першої картки та сторінки) |
| [**`homework/homework-backend.md`**](homework/homework-backend.md) | Домашнє завдання з Backend (.NET 10 Lambdas, API Gateway, DynamoDB) |
| [**`homework/homework-aqa.md`**](homework/homework-aqa.md) | Домашнє завдання з Test Automation (Playwright, Reqnroll, API) |
| [**`homework/homework-design/`**](homework/homework-design/) | Макети екранів з Figma (PNG) та опис відповідності макету |

---

## 🚀 Швидкий старт для розробки (Frontend)

Для виконання рівнів 1–2 фронтенд-завдання бекенд не потрібен — усе працює на локальних моках:

1. **Встановіть залежності та запустіть застосунок:**
   ```bash
   cd frontend/restaurant-frontend-app
   npm ci
   npm start
   ```
2. **Відкрийте у браузері:**
   - **Хмарне демо (Devs.Surf):**
     ```text
     https://green-tasty.devs.surf/reservations/demo-reservation/group-order?demo
     ```
   - **Локальний dev-сервер:**
     ```text
     http://localhost:4200/reservations/demo-reservation/group-order?demo
     ```
   *Параметр `?demo` автоматично активує тестову сесію Owner без потреби у розгортанні Cognito чи бази даних.*

3. **Запуск тестів домашнього завдання:**
   ```bash
   npm run test:hw
   ```

4. **Перевірки перед здачею:**
   ```bash
   npx tsc -p tsconfig.app.json  --noEmit
   npx tsc -p tsconfig.spec.json --noEmit
   BACKEND_URL=https://example.com npm run build
   npm run test:hw
   ```

---

## 🧪 Швидкий старт для Test Automation (AQA)

```bash
cd aqa/restaurant-aqa-framework
cp .env.example .env
# Заповніть адреси та тестові облікові записи у файлі .env
dotnet build
dotnet test
```

---

# Deployment Guide

This repo uses three deployment tracks:

- Terraform for shared AWS infrastructure under `infra/terraform`
- AWS Syndicate for the backend application under `backend/restaurant-backend-app`
- Angular build artifacts synced to the frontend S3 bucket under `frontend/restaurant-frontend-app`

## Prerequisites

Install the tools below on your machine:

- AWS CLI configured with credentials for the target AWS account (`aws configure`) (https://docs.aws.amazon.com/cli/latest/userguide/getting-started-prereqs.html)
- Terraform 1.10 or newer (https://developer.hashicorp.com/terraform/install)
- Python 3.10-3.11 (https://www.python.org/downloads/release/python-3110/)
- .NET 10 SDK (https://dotnet.microsoft.com/en-us/download/dotnet/10.0)
- AWS Syndicate (`pip install aws-syndicate`) (https://github.com/epam/aws-syndicate)
- Node.js 22.x with npm (https://nodejs.org/en/download/archive/v22.0.0)

## Deployment order

Use this order:

1. Deploy Terraform infrastructure
2. Deploy the backend using Syndicate
3. Deploy the frontend to s3
4. Seed initial database data (`scripts/seed-dynamodb.py`)

Terraform then provisions or updates the shared AWS foundation, including the frontend S3 bucket and CloudFront distribution. Syndicate packages and deploys the backend application stack. After that, build the Angular app with the correct backend URL and sync it to S3.

## 1. Deploy Terraform infrastructure

Terraform manages the shared infrastructure resources in `infra/terraform`.

Before deploying, verify terraform config files:
Replace variables with your **AWS account ID** and **Email**

- `infra/terraform/backend.tf` - replace the Terraform state bucket name
- `infra/terraform/variables.tf` - replace the default `account_id` and `alert_emails`


Before running `terraform init`, create the Terraform state bucket with AWS CLI if it does not already exist. 
Get your AWS account ID from the CLI first:

Windows PowerShell:

```powershell
$ACCOUNT_ID = aws sts get-caller-identity --query Account --output text
```

Linux or macOS:

```bash
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
```

You can use AWS Console interface
AWS Management Console equivalent:
- Go to **S3** → **Create bucket** and use the bucket name **restaurant-terraform-state-$ACCOUNT_ID**
- Turn on **Versioning** in the bucket properties
- Leave **Block all public access** enabled
- Use **Default encryption** with SSE-S3 (AES256)

As alternative you can you AWS CLI
Replace the bucket name with the CLI variable:

Windows PowerShell:

```powershell
aws s3api create-bucket `
	--bucket restaurant-terraform-state-$ACCOUNT_ID `
	--region us-west-2 `
	--create-bucket-configuration LocationConstraint=us-west-2

aws s3api put-bucket-versioning `
	--bucket restaurant-terraform-state-$ACCOUNT_ID `
	--versioning-configuration Status=Enabled

aws s3api put-public-access-block `
		--bucket restaurant-terraform-state-$ACCOUNT_ID `
	--public-access-block-configuration `
		"BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
```

Linux or macOS:

```bash
aws s3api create-bucket \
	--bucket restaurant-terraform-state-$ACCOUNT_ID \
	--region us-west-2 \
	--create-bucket-configuration LocationConstraint=us-west-2

aws s3api put-bucket-versioning \
	--bucket restaurant-terraform-state-$ACCOUNT_ID \
	--versioning-configuration Status=Enabled

aws s3api put-public-access-block \
		--bucket restaurant-terraform-state-$ACCOUNT_ID \
	--public-access-block-configuration \
		"BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
```

### After bucket creation
```bash
cd ../../infra/terraform
terraform init
terraform fmt -check -recursive
terraform validate
terraform plan
terraform apply -auto-approve
```

## 2. Deploy the backend with Syndicate

The backend app is deployed from `backend/restaurant-backend-app`.

Before deploying, verify the Syndicate config files:
edit syndicate.yml → set project_path to your local absolute path to backend/restaurant-backend-app
Replace bucket names with your AWS account ID
- `.syndicate-config-restaurant-backend-app/syndicate.yml`
- `.syndicate-config-restaurant-backend-app/syndicate_aliases.yml`

On Windows PowerShell, run:

```powershell
cd ../../backend/restaurant-backend-app
python3 -m venv syndicate_venv
.\syndicate_venv\Scripts\Activate.ps1
pip install aws-syndicate
$env:SDCT_CONF = (Resolve-Path ".\.syndicate-config-restaurant-backend-app").Path
syndicate create-deploy-target-bucket
syndicate build
syndicate deploy --deploy_name dev
```

On Linux or macOS, run:

```bash
cd ../../backend/restaurant-backend-app
python3 -m venv syndicate_venv
source syndicate_venv/bin/activate
export SDCT_CONF="$(pwd)/.syndicate-config-restaurant-backend-app"
syndicate create-deploy-target-bucket
syndicate build
syndicate deploy --deploy_name dev
```

For an incremental update instead of a full deploy, run the matching command for your shell.

```
syndicate update
```

## 3. Deploy the frontend

This section describes the manual deployment flow. It does not use GitHub Actions.

Terraform creates and configures everything needed for frontend hosting:

- the frontend S3 bucket (with static website hosting and SPA index.html fallback routing)
- the bucket policy allowing public website access

> [!NOTE]
> **CloudFront is unavailable for new AWS accounts without a support request:**
> AWS automatically restricts CloudFront distribution creation on newly registered accounts until an AWS Support case/letter is submitted and approved. For this reason, the frontend is configured to serve directly via **S3 Static Website Hosting** (with `cloudfront.tf.disabled`). Once CloudFront is activated for your account by AWS Support, `cloudfront.tf` can be re-enabled.

You do not need to configure the bucket manually after `terraform apply`. The manual part is only building the frontend and uploading the files to S3.

### 3.1 Get the backend URL

Use the deployed API Gateway base URL as `BACKEND_URL`. Example:

```text
https://<api-id>.execute-api.us-west-2.amazonaws.com/develop
```

The production frontend build will fail unless `BACKEND_URL` is set.

To look it up in AWS:

```powershell
aws apigateway get-rest-apis --region us-west-2 --query "items[?name=='restaurant-backend-api'].{name:name,id:id}" --output table
```

Or set variables from AWS CLI:

Windows PowerShell:

```powershell
$API_ID = aws apigateway get-rest-apis --region us-west-2 --query "items[?name=='restaurant-backend-api'].id | [0]" --output text
$env:BACKEND_URL = "https://$API_ID.execute-api.us-west-2.amazonaws.com/develop"
```

Linux or macOS:

```bash
API_ID=$(aws apigateway get-rest-apis --region us-west-2 --query "items[?name=='restaurant-backend-api'].id | [0]" --output text)
export BACKEND_URL="https://$API_ID.execute-api.us-west-2.amazonaws.com/develop"
```

### 3.2 Build the production bundle

From the frontend app directory, install dependencies and build:

```powershell
cd ../../frontend/restaurant-frontend-app
npm ci
npm run build
```

The build process generates `src/environments/environment.production.ts` automatically from `BACKEND_URL` and writes the production bundle to `dist/restaurant-frontend-app/browser`.

### 3.3 Upload the bundle to S3

Sync the built files to the frontend bucket:

```powershell
aws s3 sync dist/restaurant-frontend-app/browser s3://restaurant-frontend-$ACCOUNT_ID/ --delete
```

The `--delete` flag removes files in S3 that no longer exist in the local build output.

### 3.4 Get the frontend URL

While CloudFront is unavailable for new accounts without an AWS Support request letter, access the application directly via the **S3 Static Website Hosting** endpoint:

```text
http://restaurant-frontend-$ACCOUNT_ID.s3-website.us-east-1.amazonaws.com
```

If your account has CloudFront enabled, get the CloudFront domain name from Terraform:

```powershell
cd ../../infra/terraform
terraform output cloudfront_distribution_domain_name
terraform output cloudfront_distribution_id
```

Use the returned domain name as the frontend host. Example:

```text
https://dxxxxxxxxxxxx.cloudfront.net
```

CloudFront does not provide a fixed public IP you should use. Use the distribution domain name instead.

## 4. Seed initial database data

When DynamoDB tables are first created by Terraform/Syndicate, they contain no records. Run the seeding script to populate the restaurant with realistic sample data (locations in Tbilisi, bookable tables, and menu dishes with photos):

```bash
python3 scripts/seed-dynamodb.py --region us-east-1
```

The script populates:
- **Locations (`Locations`)**: 8 restaurant locations in Tbilisi with descriptions and photo assets.
- **Tables (`Tables`)**: 44 bookable tables of various capacities (2, 4, 6, 8 guests) with GSI indexes.
- **Dishes (`Dishes`)**: 9 menu items (Appetizers, Main courses, Desserts) in `Available` state with assets.
- **Cognito Groups & Accounts**:
  - `Admin`: Administrator account for restaurant management.
  - `Waiters`: Active waiters assigned to restaurant locations registered in Cognito and DynamoDB `Waiters` table (enabling reservations, table service, and waiter dashboards).
  - `Customer`: Test customer account for reservation verification.
  - *All account credentials are stored in `credentials.env` and `credentials.json` (git-ignored).*

---

## Clean up all resources

Use the reverse order of deployment:

1. Remove uploaded frontend files from the frontend S3 bucket
2. Clean up the backend resources deployed by Syndicate
3. Destroy the shared infrastructure managed by Terraform
4. Remove the Terraform state bucket
5. Remove the Syndicate artifacts bucket

### Remove frontend files from S3

The frontend bucket must be empty before Terraform can destroy it.

```powershell
aws s3 rm s3://restaurant-frontend-$ACCOUNT_ID/ --recursive
```

If you are not using the shared training account, replace the bucket name with your own account-specific frontend bucket.

### Clean up backend resources with Syndicate

From the backend project directory, use the same Syndicate configuration and run:

```powershell
cd ../../backend/restaurant-backend-app
$env:SDCT_CONF = (Resolve-Path ".\.syndicate-config-restaurant-backend-app").Path
syndicate clean
```

On Linux or macOS, use:

```bash
cd ../../backend/restaurant-backend-app
export SDCT_CONF="$(pwd)/.syndicate-config-restaurant-backend-app"
syndicate clean
```

This removes the backend resources that Syndicate deployed into the AWS account.

### Destroy Terraform-managed infrastructure

After the frontend bucket is empty and the backend resources are removed, destroy the shared infrastructure:

```powershell
cd ../../infra/terraform
terraform destroy -auto-approve
```

This removes the frontend S3 bucket, CloudFront distribution, and the rest of the infrastructure managed in `infra/terraform`.

### Clear versioned bucket

S3 bucket for storing terraform state have versioning configured. In order to delete it you must empty all versions created for s3 object.

- Go to **S3** select **restaurant-terraform-state-$ACCOUNT_ID** → **Empty Bucket**

### Remove the Terraform state bucket

The Terraform state bucket is configured in `infra/terraform/backend.tf` and is not deleted by `terraform destroy`. Empty it first and then delete it manually:

```powershell
aws s3api delete-bucket --bucket restaurant-terraform-state-$ACCOUNT_ID --region us-west-2
```

### Remove the Syndicate artifacts bucket

The Syndicate deploy target bucket is not managed by Terraform in this repo. If you also want to delete that bucket, empty it first and then remove it manually:

```powershell
aws s3 rm s3://marathon2026-restaurant-artifacts-$ACCOUNT_ID/ --recursive
aws s3api delete-bucket --bucket marathon2026-restaurant-artifacts-$ACCOUNT_ID --region us-west-2
```

Only do this if you are sure you no longer need the stored Syndicate build artifacts.

---

## 👥 Contributors

Thanks goes to these wonderful people and AI contributors:

<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%">
        <a href="https://github.com/serjorezz">
          <img src="https://github.com/serjorezz.png?size=100" width="100px;" alt="serjorez"/><br />
          <sub><b>serjorez</b></sub>
        </a><br />
        <a href="https://github.com/serjorezz/epam-marathon-2026/commits?author=serjorezz" title="Code">💻</a>
        <a href="https://github.com/serjorezz/epam-marathon-2026/commits?author=serjorezz" title="Maintenance">🚧</a>
        <a href="#infra" title="Infrastructure & Deployment">🚇</a>
      </td>
      <td align="center" valign="top" width="14.28%">
        <a href="https://gemini.google.com/">
          <img src="https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d4735304ff6292a690345.svg" width="100px;" alt="Google Gemini"/><br />
          <sub><b>Google Gemini</b></sub>
        </a><br />
        <a href="https://gemini.google.com/" title="AI Pair Programmer">🤖</a>
        <a href="https://github.com/serjorezz/epam-marathon-2026/commits" title="Code & Documentation">💻</a>
        <a href="#ideas" title="Ideas & Architecture">💡</a>
      </td>
    </tr>
  </tbody>
</table>
