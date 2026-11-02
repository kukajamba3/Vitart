# АнимеХаб

Самостоятельный сайт для просмотра аниме: каталог, поиск, фильтры по жанрам/годам, страницы тайтлов с выбором озвучки и плеером. Данные — из публичных API двух источников озвучек (в UI названия источников показываются только в переключателе «Озвучка»). Регистрация с обязательным подтверждением почты через **Resend**, база — **PostgreSQL**.

Стек: **Next.js 14 (App Router, SSR) + TypeScript + Tailwind + Prisma/PostgreSQL + Resend + hls.js**. Деплой — на **Layero** (российский PaaS, серверы в РФ, `*.layero.app` + HTTPS бесплатно).

---

## 1. Что нужно сделать вам

### 1.1. Аккаунт и проект на Layero
1. Зайдите на [app.layero.ru](https://app.layero.ru) (вход по почте или Яндекс) — бесплатный тариф: до 5 проектов, адрес `https://<проект>.layero.app` с HTTPS, деплой по push в git и превью на каждую ветку.
2. Подключите этот GitHub-репозиторий к проекту (или деплойте командой `npx layero@latest deploy` — см. ниже). Проект уже лежит **в корне репозитория** (там `package.json`), дополнительно ничего указывать не нужно.
3. Тип приложения задаётся файлом [`layero.json`](layero.json) в корне: `"runtime": "ssr_next"` — значит, Next.js с SSR/API запускается контейнером, а не раздаётся статикой. Этого достаточно, в панели менять ничего не надо.

### 1.2. База данных (PostgreSQL) — один из вариантов
- **Вариант A — база Layero** (удобно, всё в одном месте): панель → **Базы данных → Создать базу → PostgreSQL**, затем подключите её к проекту (**Проект → База данных**). Строка подключения сама приедет в переменную окружения **`LAYERO_DATABASE_URL`** (приложение подхватывает её автоматически). Внимание: общая (shared) база входит в тариф **Pro** (990 ₽/мес); на Free — Вариант B.
- **Вариант B — бесплатная внешняя база** (например, Supabase, бесплатный тариф): создайте проект, возьмите connection string (`postgresql://...?sslmode=require`) и добавьте его в панели Layero: **Project → Environment Variables → `DATABASE_URL`**.

Миграции применяются автоматически: env-переменные на Layero доступны **и на стадии сборки** (скрипт `db:migrate:safe` в `layero.json` → `prisma migrate deploy`), а при первом старте контейнера таблицы дополнительно создаются сами через `CREATE TABLE IF NOT EXISTS` (`src/instrumentation.ts`). Вручную ничего запускать не нужно.

### 1.3. Переменные окружения на Layero
**Project → Environment Variables** (доступны и сборке, и рантайму; значения шифруются, в git не коммитятся):

| Переменная | Зачем | Пример |
|---|---|---|
| `DATABASE_URL` | Только если база вне Layero (Вариант B) | `postgresql://user:pass@host:5432/db?sslmode=require` |
| `LAYERO_DATABASE_URL` | приедет само, если база Layero подключена к проекту | — |
| `RESEND_API_KEY` | отправка писем подтверждения | `re_xxxx` |
| `EMAIL_FROM` | адрес отправителя | `АнимеХаб <noreply@ваш-домен.ru>` |
| `SITE_URL` | публичный URL сайта (ссылки в письмах) | `https://<project>.layero.app` |
| `SITE_NAME` | имя сайта в письмах | `АнимеХаб` |
| `ANILIBRIA_API_BASE` / `ANILIBRIA_SITE` | API источника №1 (ключ не нужен) | `https://api.anilibria.tv/v2.1` |
| `ANIVOST_API_BASE` | API источника №2; при недоступности — зеркало | `https://api.animevost.org/v1` |

### 1.4. Resend (подтверждение почты)
1. Регистрация на [resend.com](https://resend.com) → **API Keys → Create API Key** → ключ `re_...` → в переменную `RESEND_API_KEY` на Layero.
2. **Domains → Add Domain** → добавьте ваш домен и пропишите предложенные DNS-записи (SPF/DKIM) у регистратора домена.
   - **До верификации домена** письма уходят только с `onboarding@resend.dev` и только на email владельца аккаунта Resend — для тестов установите `EMAIL_FROM="onboarding@resend.dev"`.
   - **Для прода**: `EMAIL_FROM="АнимеХаб <noreply@ваш-домен.ru>"` (домен должен быть верифицирован в Resend).
3. Бесплатный тариф Resend: 3000 писем/мес, 100/день.
4. Свой домен на сайте: на Pro-tарифе Layero — **Project → Домены** (авто-SSL); на Free — адрес `*.layero.app`.

### 1.5. Деплой
- **Через git** (основной способ): подключите репозиторий в проекте Layero — каждый push в `main` деплоит в production, push в другую ветку — даёт preview-ссылку. Сборка: `npm ci` → `npm run build` (prisma generate + next build + копирование prisma-движков в standalone) → `prisma migrate deploy` → старт SSR-контейнера (`next start` на `0.0.0.0:$PORT`).
- **Через CLI** с локального компьютера: `npx layero@latest deploy` (в корне репозитория).
- Логи: `npx layero@latest logs` (сборка) и `npx layero@latest logs --runtime` (работающее приложение), или в панели.

Если сборка упала с «фреймворк generic / package.json нет» — значит, проект смотрит не в ту папку: убедитесь, что деплоится **корень репозитория** (здесь лежат `package.json` и `layero.json`).

---

## 2. Локальный запуск

```bash
# локальная Postgres (или любая своя — тогда поправьте DATABASE_URL в .env.local)
docker compose up -d db        # только сервис db из compose

cp .env.example .env.local     # заполнить DATABASE_URL, RESEND_API_KEY, EMAIL_FROM, SITE_URL
npx prisma migrate dev         # создаст таблицы локально
npm install
npm run dev                    # http://localhost:3000
```

Для локального запуска всего стека (приложение + БД) можно поднять и оба сервиса compose — но для разработки достаточно `db` + `npm run dev`.

---

## 3. Как устроена регистрация с подтверждением почты

1. `POST /api/auth/register` — валидация (zod), пароль хэшируется (bcrypt), пользователь создаётся с `emailVerified=false`, токен пишется в таблицу `VerificationToken` (действует 24 ч).
2. Письмо уходит через Resend со ссылкой `SITE_URL/verify-email?token=...`.
3. `/verify-email?token=...` помечает пользователя верифицированным и удаляет токен.
4. `POST /api/auth/login` отклоняет вход до подтверждения почты (есть кнопка «отправить письмо повторно»); после входа — сессия в БД + httpOnly-кука `animehub_session` (в БД хранится только SHA-256 токена, срок 30 дней).
5. `/profile` защищён middleware + проверкой сессии в БД. Анти-спам: не чаще одного письма в минуту.

## 4. Структура проекта

```
├── layero.json                 # конфиг деплоя Layero: runtime ssr_next, команды сборки
├── package.json / next.config.mjs   # next.config: output standalone (SSR на Layero)
├── prisma/
│   ├── schema.prisma           # User, Session, VerificationToken
│   └── migrations/000000_init/ # применяется автоматически при сборке
├── src/
│   ├── instrumentation.ts      # при старте сервера создаёт таблицы, если их нет
│   ├── middleware.ts           # защита /profile
│   ├── app/                    # страницы: /, /catalog, /title/[code], /vost/[id],
│   │                           # /login, /register, /verify-email, /profile
│   │   └── api/                # /api/search, /api/auth/{register,login,logout,resend-verification}
│   ├── components/             # Header, SearchBox, TitleCard, VoiceSelector, Player (hls.js), ...
│   └── lib/
│       ├── auth.ts             # сессии, токены, пароли
│       ├── email.ts            # письмо через Resend
│       ├── migrate.ts          # ensureDb: CREATE TABLE IF NOT EXISTS при старте
│       └── sources/            # адаптеры API: anilibria.ts, animevost.ts, index.ts
├── scripts/copy-standalone.cjs # копирует prisma-клиент/движок в .next/standalone
├── Dockerfile / docker-compose.yml  # опционально: свой VPS или локальная разработка
└── deploy/nginx-site.conf      # опционально: nginx+certbot, если деплоите на свой VPS
```

## 5. Про источники данных

- У обоих источников **публичный API без ключа**; адреса вынесены в env (`ANILIBRIA_API_BASE`, `ANIVOST_API_BASE`).
- Видео AniLibria отдаётся как HLS (`.m3u8`) — играет `hls.js` (1080p/720p/480p); у AnimeVost — прямые mp4, нативный `<video>`.
- Соблюдайте правила самих источников озвучек при публикации такого агрегатора.
