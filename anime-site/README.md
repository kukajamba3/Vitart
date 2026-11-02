# АнимеХаб

Самостоятельный сайт для просмотра аниме: каталог, поиск, фильтры по жанрам/годам, страницы тайтлов с выбором озвучки и плеером. Данные берутся из публичных API двух источников озвучек (названия источников в интерфейсе показываются только в переключателе «Озвучка»). Регистрация с обязательным подтверждением почты через **Resend**.

Стек: **Next.js 14 (App Router, TypeScript) + Tailwind CSS + Prisma/PostgreSQL + Resend + hls.js**.

---

## 1. Что нужно сделать ВАМ (до запуска кода)

### 1.1. Домен
Купите домен у любого регистратора РФ (например, `reg.ru`, `.ru` стоит около 200 ₽/год) и в его DNS добавьте **A-запись**:
```
@   A   <IP-адрес вашего сервера на Layero>
```

### 1.2. Сервер на Layero
Нужен VPS с Ubuntu 22.04/24.04, минимум **1 CPU / 2 GB RAM / 20 GB диск**. По SSH выполните:
```bash
apt update && apt install -y docker.io docker-compose-plugin git
```
(или официальный скрипт: `curl -fsSL https://get.docker.com | sh`)

### 1.3. База данных — где создавать
**Отдельно регистрироваться нигде не нужно**: PostgreSQL поднимается прямо на вашем сервере Layero в Docker — см. `docker-compose.yml` (сервис `db`, данные хранятся в volume `db_data`). Приложение само применит миграции при старте (`prisma migrate deploy` в команде запуска).

Альтернатива (если не хотите БД на сервере): бесплатный проект на **Supabase** (`supabase.com`) — тогда в `.env` пропишите его `DATABASE_URL` вместо локального, а сервис `db` в compose можно удалить.

### 1.4. Resend (подтверждение почты)
1. Зарегистрируйтесь на **resend.com** (email тот, на который хотите получать письма в тестах).
2. Раздел **API Keys** → **Create API Key** → скопируйте ключ (начинается с `re_...`) — это `RESEND_API_KEY`.
3. Раздел **Domains** → **Add Domain** → введите ваш домен и добавьте предложенные **DNS-записи (SPF/DKIM/DMARC)** у регистратора домена. Статус станет *Verified*.
   - **До верификации домена** письма можно отправлять только с адреса `onboarding@resend.dev` и **только на тот email, с которого вы зарегистрировались в Resend**. Для разработки оставьте в `.env`: `EMAIL_FROM="onboarding@resend.dev"`.
   - **Для прода** (чтобы письма уходили всем пользователям с вашего домена): `EMAIL_FROM="АнимеХаб <noreply@ваш-домен.ru>"`.
4. Лимит бесплатного тарифа Resend — 3000 писем/мес, 100 писем/день — для старта достаточно.

### 1.5. Файл окружения
Скопируйте `.env.example` в `.env` и заполните:
```bash
cp .env.example .env
nano .env
```
Все переменные описаны в комментариях внутри `.env.example`. Минимум: `RESEND_API_KEY`, `EMAIL_FROM`, `SITE_URL`, `DATABASE_URL`.

---

## 2. Локальный запуск (для проверки)

```bash
# нужна локальная Postgres, например:
docker run -d --name pg -e POSTGRES_USER=anime -e POSTGRES_PASSWORD=anime -e POSTGRES_DB=animehub -p 5432:5432 postgres:16-alpine

npm install
npx prisma migrate dev        # создаст таблицы
npm run dev                   # http://localhost:3000
```

Тест регистрации: на стадии неверифицированного домена Resend письмо придёт только на ваш email — откройте ссылку `/verify-email?token=...` из письма, затем войдите.

---

## 3. Деплой на Layero (пошагово)

```bash
ssh root@<IP-сервера>
mkdir -p /opt/animehub && cd /opt/animehub
git clone <URL-вашего-репозитория> .
cp .env.example .env && nano .env     # заполнить все значения, SITE_URL=https://ваш-домен.ru

# SSL-сертификат (бесплатный Let's Encrypt) + nginx как reverse proxy:
apt install -y nginx certbot python3-certbot-nginx
cp deploy/nginx-site.conf /etc/nginx/sites-available/animehub.conf
# в файле замените your-domain.ru на ваш домен
ln -sf /etc/nginx/sites-available/animehub.conf /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx
certbot --nginx -d your-domain.ru      # выпустит сертификат и пропишет HTTPS в конфиг

# Запуск приложения (БД + сайт в Docker):
docker compose up -d --build

docker compose logs -f app            # смотреть логи
```

В `docker-compose.yml` приложение слушает `3000` и (по умолчанию для продакшена с nginx) привязано к `127.0.0.1:3000:3000`, чтобы наружу торчал только nginx. Если хотите открыть сайт напрямую без nginx (для быстрой проверки) — поменяйте на `"3000:3000"`.

### Обновление сайта после правок
```bash
cd /opt/animehub && git pull && docker compose up -d --build
```

---

## 4. Переменные окружения

| Переменная | Зачем | Пример |
|---|---|---|
| `DATABASE_URL` | Подключение к Postgres (в compose подставляется автоматически из `POSTGRES_*`) | `postgresql://anime:anime@db:5432/animehub?schema=public` |
| `POSTGRES_USER/PASSWORD/DB` | Параметры БД в Docker | `anime` / `anime` / `animehub` |
| `RESEND_API_KEY` | Ключ Resend для отправки почты | `re_xxxx` |
| `EMAIL_FROM` | Адрес отправителя | `АнимеХаб <noreply@your-domain.ru>` |
| `SITE_URL` | Публичный URL сайта (ссылки в письмах) | `https://your-domain.ru` |
| `SITE_NAME` | Имя сайта в письмах и заголовках | `АнимеХаб` |
| `ANILIBRIA_API_BASE` | База API источника №1 (ключ не нужен) | `https://api.anilibria.tv/v2.1` |
| `ANILIBRIA_SITE` | Домен для сборки абсолютных ссылок на постеры | `https://anilibria.tv` |
| `ANIVOST_API_BASE` | База API источника №2; если недоступен из РФ — укажите актуальное зеркало | `https://api.animevost.org/v1` |

---

## 5. Как устроена регистрация с подтверждением почты

1. `POST /api/auth/register` — валидирует данные (zod), хэширует пароль (bcrypt), создаёт пользователя с `emailVerified=false` и токен в таблице `VerificationToken` (действует 24 ч, хранится в Postgres — это и есть «база для проверки почты»).
2. Письмо уходит через Resend со ссылкой `SITE_URL/verify-email?token=...`.
3. `/verify-email?token=...` помечает пользователя верифицированным и удаляет токен.
4. `POST /api/auth/login` — отказывает вход до подтверждения почты (с кнопкой «отправить письмо повторно»), после входа создаёт сессию в БД и ставит httpOnly-куку `animehub_session` (в БД хранится только SHA-256 токена, 30 дней).
5. `/profile` защищён middleware + проверкой сессии в БД.

## 6. Структура проекта

```
anime-site/
├── prisma/schema.prisma        # User, Session, VerificationToken
├── docker-compose.yml          # app + postgres
├── Dockerfile
├── deploy/nginx-site.conf      # reverse proxy + SSL (certbot)
└── src/
    ├── app/                    # страницы: /, /catalog, /title/[code], /vost/[id],
    │                           # /login, /register, /verify-email, /profile
    │   └── api/                # /api/search, /api/auth/{register,login,logout,resend-verification}
    ├── components/             # Header, SearchBox, TitleCard, VoiceSelector, Player (hls.js), ...
    ├── lib/
    │   ├── auth.ts             # сессии, токены, пароли
    │   ├── email.ts            # отправка письма через Resend
    │   └── sources/            # адаптеры API: anilibria.ts, animevost.ts, index.ts (сопоставление тайтлов)
    └── middleware.ts           # защита /profile
```

## 7. Про источники данных

- У обоих источников **публичный API без ключа**; адреса вынесены в `.env` (`ANILIBRIA_API_BASE`, `ANIVOST_API_BASE`), поэтому при смене зеркала ничего в коде менять не нужно.
- Видеопотоки AniLibria отдаются как HLS (`.m3u8`) — их играет `hls.js`; у AnimeVost — прямые mp4-ссылки, играются нативным `<video>`.
- Пожалуйста, соблюдайте правила и условия самих источников озвучек при публикации такого агрегатора.
