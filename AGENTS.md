# Ph — AGENTS.md

Файл для AI-агентов, работающих с проектом. Читатель предполагается ничего не знающим о проекте.

---

## Обзор проекта

**Ph** — веб-приложение для изучения школьной физики. Платформа объединяет:

- Курс теории по 12 темам физики (кинематика, динамика, электричество, оптика, квантовая физика и др.)
- Интерактивные виртуальные лабораторные работы (закон Ома, маятник, дифракция, фотоэффект и др.)
- Банк задач с разбором (только для администраторов)
- Систему отслеживания прогресса для учеников
- Управление учениками администратором/учителем

Проект — полнофулстековое монолитное приложение в директории `app/`. Фронтенд и бэкенд запускаются единым Vite dev-сервером.

---

## Стек технологий

| Слой | Технология |
|------|-----------|
| Фронтенд | React 19, TypeScript, Vite 7 |
| Бэкенд | Hono 4, tRPC 11, Node.js 20 |
| База данных | MySQL 8, Drizzle ORM |
| Стили | Tailwind CSS 3.4, shadcn/ui |
| Аутентификация | OAuth 2.0 через Kimi Platform + собственная JWT-сессия для учеников |
| Сериализация | superjson |
| Валидация | Zod |
| Тестирование | Vitest |
| Сборка | Vite (фронтенд) + esbuild (бэкенд) |

---

## Структура проекта

```
app/
├── api/                    # Бэкенд (Hono + tRPC)
│   ├── boot.ts             # Точка входа сервера
│   ├── router.ts           # Корневой tRPC-роутер
│   ├── middleware.ts       # Процедуры tRPC (public, authed, admin, student)
│   ├── context.ts          # Создание tRPC-контекста (аутентификация)
│   ├── auth-router.ts      # Роутер аутентификации (me, logout, claimAdmin)
│   ├── course-router.ts    # Публичные данные курса (темы, подтемы, лабы, ресурсы)
│   ├── progress-router.ts  # Прогресс пользователя (OAuth)
│   ├── problems-router.ts  # Управление задачами (admin-only)
│   ├── admin-router.ts     # CRUD для тем, подтем, задач
│   ├── student-router.ts   # Аутентификация и прогресс учеников
│   ├── student-session.ts  # JWT-токены для учеников
│   ├── kimi/               # Интеграция с Kimi Platform
│   │   ├── auth.ts         # OAuth callback, обмен code → token
│   │   ├── platform.ts     # API-запросы к Kimi Open
│   │   ├── session.ts      # Подпись/верификация сессионных JWT
│   │   └── types.ts        # Типы Kimi API
│   ├── queries/            # SQL-запросы через Drizzle
│   │   ├── connection.ts   # Инициализация Drizzle
│   │   ├── users.ts        # Запросы к таблице users
│   │   └── students.ts     # Запросы к таблице students
│   └── lib/                # Утилиты бэкенда
│       ├── env.ts          # Переменные окружения
│       ├── cookies.ts      # Настройки сессионных cookie
│       └── vite.ts         # Раздача статики в production
├── src/                    # Фронтенд (React)
│   ├── main.tsx            # Точка входа (StrictMode + HashRouter + TRPCProvider)
│   ├── App.tsx             # Корневой компонент с маршрутизацией
│   ├── const.ts            # Константы фронтенда (LOGIN_PATH)
│   ├── pages/              # Страницы приложения
│   │   ├── Home.tsx
│   │   ├── Course.tsx
│   │   ├── Labs.tsx
│   │   ├── Login.tsx
│   │   ├── StudentLogin.tsx
│   │   ├── StudentDashboard.tsx
│   │   ├── LabPendulum.tsx, OhmsLawLab.tsx, ProjectileLab.tsx ...
│   │   └── admin/AdminProblems.tsx
│   │   └── admin/LabManagement.tsx   # Редактор лабораторий (категории/темы/работы/симуляции)
│   ├── components/         # React-компоненты
│   │   ├── Header.tsx
│   │   ├── AuthLayout.tsx
│   │   └── ui/             # 50+ компонентов shadcn/ui
│   ├── hooks/              # Кастомные хуки
│   │   ├── useAuth.ts      # Хук аутентификации преподавателя
│   │   ├── useStudentAuth.ts
│   │   └── use-mobile.ts
│   ├── providers/          # React-провайдеры
│   │   └── trpc.tsx        # Настройка tRPC-клиента
│   ├── contexts/           # React-контексты
│   │   └── ViewAsStudentContext.tsx
│   ├── data/               # Статические данные
│   │   ├── courseTopics.ts
│   │   └── labs.ts
│   └── lib/                # Утилиты фронтенда
│       └── utils.ts        # cn() — merge clsx + tailwind-merge
├── contracts/              # Общие типы и константы
│   ├── constants.ts        # Session.cookieName, Paths, ErrorMessages
│   ├── errors.ts           # Фабрика ошибок приложения
│   └── types.ts            # Реэкспорт типов из db/schema
├── db/                     # Схема БД и миграции
│   ├── schema/             # Доменные модули схемы Drizzle
│   │   ├── auth.ts         # Роли, разрешения, пользователи
│   │   ├── content.ts      # Темы, подтемы, topic_nodes, labs, resources
│   │   ├── learning.ts     # enrollments, student_progress, lab_progress
│   │   ├── labs.ts         # Виртуальные лаборатории + реестр симуляций
│   │   ├── problems.ts     # Банк задач
│   │   ├── jupyter.ts      # Jupyter-ноутбуки
│   │   ├── notifications.ts
│   │   ├── timeline.ts
│   │   ├── audit.ts
│   │   ├── media.ts
│   │   └── index.ts        # Реэкспорт всех доменов
│   ├── schema.ts           # Реэкспорт schema/ для обратной совместимости
│   ├── relations/          # Доменные Drizzle-отношения
│   ├── relations.ts        # Реэкспорт relations/
│   ├── seed.ts             # Начальные данные (12 тем, 48 подтем, 6 лаб, ресурсы)
│   ├── migrations/         # SQL-миграции Drizzle Kit
│   ├── problems-seed.ts    # Сид задач
│   └── simulations-seed.ts # Реестр физических симуляций
├── public/                 # Статические ассеты (изображения)
└── scripts/                # Вспомогательные скрипты
```

---

## Запуск и разработка

### Предварительные требования

- Node.js 20+
- MySQL (устанавливается через `brew install mysql`)
- Файл `.env` на основе `.env.example`

### Переменные окружения (`.env`)

```bash
# ── Бэкенд ──
APP_ID=                   # ID приложения Kimi
APP_SECRET=               # Секрет для подписи JWT

# ── База данных ──
DATABASE_URL=             # mysql://user:pass@host:port/db
# Опционально: отдельные базы для каждого домена (если не заданы, используется DATABASE_URL)
# DATABASE_URL_AUTH=      # mysql://user:pass@host:port/labphschool_auth
# DATABASE_URL_CONTENT=
# DATABASE_URL_LEARNING=
# DATABASE_URL_LABS=
# DATABASE_URL_PROBLEMS=
# DATABASE_URL_JUPYTER=
# DATABASE_URL_NOTIFICATIONS=
# DATABASE_URL_TIMELINE=
# DATABASE_URL_AUDIT=
# DATABASE_URL_MEDIA=

# ── Фронтенд (доступны в браузере через Vite) ──
VITE_KIMI_AUTH_URL=       # URL OAuth-сервера Kimi
VITE_APP_ID=              # OAuth app ID

# ── Бэкенд (Auth) ──
KIMI_AUTH_URL=            # URL OAuth-сервера Kimi (бэкенд)
KIMI_OPEN_URL=            # URL Kimi Open Platform

# ── Админ ──
OWNER_UNION_ID=           # Union ID создателя; получает роль admin при первом входе
```

### Команды

```bash
cd app/

# Установка зависимостей
npm install

# Запуск dev-сервера (порт 3000)
npm run dev

# Сборка production
npm run build

# Запуск production-сервера
npm run start

# Проверка типов
npm run check

# Линтинг
npm run lint

# Форматирование
npm run format

# Тесты
npm run test

# Миграции базы данных
npm run db:generate   # Сгенерировать миграции
npm run db:migrate    # Применить миграции
npm run db:push       # Push схемы (для разработки)
```

### Первый запуск

1. Запустить MySQL: `brew services start mysql`
2. Установить зависимости: `npm install`
3. Создать/обновить схему БД:
   - Вариант A (миграции): `npm run db:migrate`
   - Вариант B (пересоздать БД): удалить базу вручную и выполнить `npm run db:push` (интерактивно) или применить все миграции с нуля
4. Заполнить начальные данные:
   - `npx tsx db/seed.ts`
   - `npx tsx db/simulations-seed.ts`
5. Запустить dev: `npm run dev`
6. Открыть http://localhost:3000

> **Миграции не являются критичными для сохранности данных.** В проекте нет требования сохранять пользовательские данные на хостинге, поэтому при конфликтах схемы проще пересоздать базу данных и запустить сиды заново.

---

## Архитектура

### Полнофулстековый режим

В development режиме Vite одновременно:
- Раздаёт фронтенд (React SPA)
- Обрабатывает API-запросы через Hono (`api/boot.ts`)

В production:
- Фронтенд собирается в `dist/public/`
- Бэкенд бандлится esbuild в `dist/boot.cjs` (CommonJS для совместимости с Phusion Passenger)
- Hono node-server раздаёт статику из `dist/public/` и обрабатывает API

### Двойная система аутентификации

1. **Преподаватели/админы** — OAuth 2.0 через Kimi Platform:
   - Авторизация через внешний OAuth-сервер
   - Сессия в httpOnly cookie (`kimi_sid`)
   - Роли: `user` | `admin`
   - Первый пользователь с `OWNER_UNION_ID` автоматически становится admin

2. **Ученики** — локальная аутентификация:
   - Логин/пароль (SHA-256 + соль)
   - JWT-токен сохраняется в `localStorage` (`student_token`)
   - Передаётся в заголовке `x-student-token`

### tRPC-роутеры и middleware

| Процедура | Описание |
|-----------|----------|
| `publicQuery` | Без авторизации |
| `authedQuery` | Требуется OAuth-сессия (преподаватель) |
| `adminQuery` | Требуется роль `admin` |
| `studentQuery` | Требуется ученический JWT-токен |

### База данных (MySQL + Drizzle ORM)

Схема разбита на bounded contexts (домены) в `app/db/schema/`:

| Домен | Таблицы | Подключение |
|---|---|---|
| `auth` | `roles`, `permissions`, `role_permissions`, `users`, `local_users` | `getAuthDb()` |
| `content` | `topics`, `subtopics`, `topic_nodes`, `labs`, `resources` | `getContentDb()` |
| `learning` | `enrollments`, `student_progress`, `lab_progress` | `getLearningDb()` |
| `labs` | `lab_categories`, `lab_subcategories`, `lab_works`, `lab_blocks`, `lab_analytics`, `simulations` | `getLabsDb()` |
| `problems` | `problem_types`, `problems` | `getProblemsDb()` |
| `jupyter` | `jupyter_notebooks`, `jupyter_notebook_access` | `getJupyterDb()` |
| `notifications` | `notifications` | `getNotificationsDb()` |
| `timeline` | `timeline_entries` | `getTimelineDb()` |
| `audit` | `audit_log` | `getAuditDb()` |
| `media` | `images` | `getMediaDb()` |

Между доменами нет внешних ключей на уровне БД — связи реализованы через soft-ссылки (`id` + домен). Это позволяет в будущем разнести домены по разным физическим базам данных, изменив только переменные окружения `DATABASE_URL_*`.

---

## Архитектура лабораторных работ

Лабораторные работы строятся по принципу «каталог + карточка»:

- **Каталог** (`/labs`) показывает разделы физики (`lab_categories`).
- **Категория** (`/labs/category/:slug`) группирует работы по подкатегориям (`lab_subcategories`).
- **Карточка** (`/labs/work/:slug`) отображает теорию, выбранную симуляцию, измерения, графики и вывод.

### Реестр симуляций

Все интерактивные симуляции зарегистрированы в таблице `simulations`:

| Поле | Назначение |
|------|-----------|
| `slug` | Уникальный идентификатор, совпадает с ключом в кодовом объекте `simComponents` |
| `title` | Название для админки |
| `description` | Описание |
| `category` | Раздел физики |
| `componentRef` | Ссылка на React-компонент (обычно совпадает со `slug`) |
| `config` | JSON с готовыми параметрами симуляции (`SimulationParamConfig[]`) |
| `isActive` | Видна ли симуляция в списке выбора |

Список существующих симуляций заполняется скриптом `db/simulations-seed.ts`.

### Lab Management

Админ-страница `/admin/lab-management` объединяет управление:
- разделами (`lab_categories`)
- темами (`lab_subcategories`)
- лабораторными работами (`lab_works`)
- выбором симуляции из реестра (`simulations`)

Параметры симуляции задаются один раз в реестре (`simulations.config`) и не требуют настройки при подключении к работе.

Теоретическая часть пишется в Markdown (редактор `@uiw/react-md-editor`) с поддержкой формул и картинок. Картинки загружаются через `/api/upload/image` и вставляются в Markdown.

### Связь работы и симуляции

Поле `lab_works.simulationSlug` — soft-link на `simulations.slug`. Страница `LabWorkPage.tsx` выбирает React-компонент симуляции по `simulationSlug`, а не по `slug` лаборатории. Это позволяет переиспользовать одну симуляцию в разных работах.

---

## Стиль кода

### TypeScript

- Строгий режим (`strict: true`)
- Запрещены неиспользуемые переменные и параметры (`noUnusedLocals`, `noUnusedParameters`)
- `verbatimModuleSyntax` — импорты типов через `type`
- `allowImportingTsExtensions` — расширения `.ts` в импортах

### Пути (alias)

| Alias | Путь |
|-------|------|
| `@/` | `./src/` |
| `@contracts/` | `./contracts/` |
| `@db/` | `./db/` |

### Prettier (`.prettierrc`)

- `semi: true`
- `singleQuote: false` (двойные кавычки)
- `printWidth: 80`
- `tabWidth: 2` (пробелы)
- `trailingComma: "es5"`
- `arrowParens: "avoid"`

### ESLint

- `@eslint/js` recommended
- `typescript-eslint` recommended
- `eslint-plugin-react-hooks` recommended
- `eslint-plugin-react-refresh`
- Игнорируется директория `dist/`

---

## Тестирование

- **Фреймворк**: Vitest
- **Среда**: node
- **Поиск тестов**: `api/**/*.test.ts`, `api/**/*.spec.ts`
- Запуск: `npm run test`
- На текущий момент тестовые файлы в проекте отсутствуют

---

## Маршруты фронтенда (React Router, HashRouter)

| Путь | Страница | Доступ |
|------|----------|--------|
| `/` | Главная | Публичный |
| `/course` | Курс физики | Публичный |
| `/labs` | Разделы физики / каталог лабораторий | Публичный |
| `/labs/category/:slug` | Категория лабораторных работ | Публичный |
| `/labs/work/:slug` | Карточка лабораторной работы | Публичный |
| `/admin/lab-management` | Lab Management (редактор) | Требуется admin |
| `/resources` | Ресурсы | Публичный |
| `/about` | О проекте | Публичный |
| `/login` | Вход для преподавателя | Публичный |
| `/profile` | Профиль преподавателя | Требуется OAuth |
| `/admin/problems` | Управление задачами | Требуется admin |
| `/student/login` | Вход для ученика | Публичный |
| `/student/dashboard` | Дашборд ученика | Требуется ученик |
| `/student/profile` | Профиль ученика | Требуется ученик |
| `/student/labs` | Протоколы лабораторных | Требуется ученик |

---

## Соглашения по разработке

### Именование

- Компоненты React: PascalCase (`Header.tsx`, `StudentDashboard.tsx`)
- Хуки: camelCase с префиксом `use` (`useAuth`, `useStudentAuth`)
- Роутеры tRPC: суффикс `-router.ts` (`auth-router.ts`, `student-router.ts`)
- Запросы к БД: суффикс `s.ts` в `queries/` (`students.ts`, `users.ts`)

### Аутентификация в tRPC

- Для защиты эндпоинта используй `authedQuery`, `adminQuery` или `studentQuery` из `api/middleware.ts`
- Никогда не доверяй `ctx.user` или `ctx.student` без middleware

### Работа с БД

- Используй фабрику нужного домена из `api/queries/connection.ts`: `getAuthDb()`, `getContentDb()`, `getLearningDb()` и т.д.
- Устаревший `getDb()` оставлен только для обратной совместимости; в новом коде не используй его.
- Схема разделена по доменам в `db/schema/<domain>.ts`; `db/schema.ts` — реэкспорт для совместимости.
- Для новых таблиц добавь типы в `contracts/types.ts` (реэкспорт из `db/schema`)

### Добавление новой страницы

1. Создать компонент в `src/pages/`
2. Добавить импорт и маршрут в `src/App.tsx`
3. При необходимости добавить ссылку в `Header.tsx`

### Добавление нового API-эндпоинта

1. Добавить процедуру в соответствующий `*-router.ts`
2. Использовать `z.object({...})` для валидации input
3. Выбрать подходящую middleware (`publicQuery` / `authedQuery` / `adminQuery` / `studentQuery`)

---

## Безопасность

- `APP_SECRET` используется для подписи **всех** JWT-токенов (сессии преподавателей и учеников)
- Сессионные cookie: `httpOnly`, `secure` (в production), `sameSite: "None"` (в production) / `"Lax"` (localhost)
- Пароли учеников хешируются SHA-256 с солью `quant-salt-2026`
- Тело запроса ограничено 50 МБ (`bodyLimit`)
- Первый вход через OAuth автоматически создаёт пользователя; роль `admin` назначается только при совпадении `unionId` с `OWNER_UNION_ID`

---

## Полезные скрипты

| Файл | Назначение |
|------|-----------|
| `create_tables.cjs` | Создание таблиц (устаревший, используйте миграции Drizzle) |
| `make-admin.cjs` | Назначение роли admin пользователю по unionId |
| `seed_problems.cjs` | Сид задач кинематики |
| `scripts/create-student-tables.mjs` | Создание таблиц для учеников |
| `db/seed.ts` | Полный сид начальных данных (темы, подтемы, лабы, ресурсы) |

---

## Язык проекта

- Основной язык интерфейса: **русский**
- Код и комментарии: русский/английский (смешанно)
- Названия переменных: camelCase на английском
- Документация пользователя: `ЗАПУСК.md` (русский)
