# Blog Platform API

REST API для фронтенда `blog-platform` (формат близкий к RealWorld/Conduit).

## Что есть в API

- авторизация и профиль:
  - `POST /api/users`
  - `POST /api/users/login`
  - `PUT /api/user`
- статьи:
  - `GET /api/articles`
  - `GET /api/articles/:slug`
  - `POST /api/articles`
  - `PUT /api/articles/:slug`
  - `DELETE /api/articles/:slug`
- лайки:
  - `POST /api/articles/:slug/favorite`
  - `DELETE /api/articles/:slug/favorite`
- служебный endpoint:
  - `GET /api/health`

## Технологии

- Node.js + TypeScript;
- Express;
- JWT (`jsonwebtoken`);
- bcrypt (`bcryptjs`);
- CORS.

## Быстрый старт

```bash
npm install
cp .env.example .env
npm run dev
```

Сборка и запуск production-версии:

```bash
npm run build
npm run start
```

По умолчанию API доступен на `http://localhost:3001/api`.

## Переменные окружения

- `PORT` — порт сервера, по умолчанию `3001`.
- `JWT_SECRET` — секрет подписи JWT.
  - в `development`: по умолчанию `dev-secret-change-me`;
  - в `production`: обязателен.
- `PUBLIC_BASE_URL` — публичный базовый URL API без `/api` (например, `https://blog-platform-api-7ru7.onrender.com`).
  - в `development`: по умолчанию `http://localhost:${PORT}`;
  - в `production`: обязателен.
- `CORS_ORIGINS` — список разрешённых origin через запятую.
- `FRONTEND_ORIGINS` / `FRONTEND_ORIGIN` — алиасы для `CORS_ORIGINS`.
- `SEED_DEMO_USERS` — добавлять демо-пользователей при старте.
  - по умолчанию: `true` в `development`, `false` в `production`.

По CORS:

- в `development` дополнительно всегда разрешены `http://localhost:3000` и `http://localhost:5173`;
- в `production` берутся только значения из env.

## Данные

Хранилище in-memory, без базы данных. После перезапуска сервера данные сбрасываются.

Что предзаполнено при старте:

- 30 статей;
- пользователь `Dmitry` (создаётся всегда, включая `production`);
- дополнительные демо-пользователи (по условиям `SEED_DEMO_USERS`).

Основной тестовый пользователь:

- `email`: `111@mail.ru`
- `password`: `111111`

## Деплой на Render

Минимально нужны переменные:

```env
JWT_SECRET=super-secret-value
PUBLIC_BASE_URL=https://blog-platform-api-7ru7.onrender.com
CORS_ORIGINS=https://blog-platform-beige-phi.vercel.app
```

Если нужно открывать этот API с локального фронтенда, добавь localhost в `CORS_ORIGINS`:

```env
CORS_ORIGINS=https://blog-platform-beige-phi.vercel.app,http://localhost:3000,http://localhost:5173
```
