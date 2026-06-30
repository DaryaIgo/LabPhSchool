# nebuls — AGENTS.md

Файл для AI-агентов, работающих с проектом. Читатель предполагается ничего не знающим о проекте.

---

## Обзор проекта

**nebuls** — веб-приложение для изучения школьной физики. Платформа объединяет:

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
| Аутентификация | Локальная JWT-сессия для администраторов и учеников |
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
│   ├── unified-auth-router.ts  # Единый вход/me/logout для админов и учеников
│   ├── course-router.ts    # Публичные данные курса
│   ├── problem-management-router.ts  # Problem Management (admin-only)
│   ├── admin-router.ts     # CRUD для тем, подтем, задач, сабмиссий, Jupyter
│   ├── student-router.ts   # CRUD учеников (admin) и личный кабинет (student)
│   ├── enrollment-router.ts # Записи на курс и назначения
│   ├── audit-router.ts     # Просмотр audit log (admin)
│   ├── virtual-lab-router.ts # Каталог лаб и админ CRUD
│   ├── timeline-router.ts  # Timeline entries
│   ├── analytics-router.ts # Статистика посещений
│   ├── admin-session.ts    # JWT cookie для admin_users
│   ├── student-session.ts  # JWT cookie для local_users
│   ├── queries/            # SQL-запросы через Drizzle
│   │   ├── connection.ts   # Инициализация Drizzle
│   │   ├── adminUsers.ts   # Запросы к admin_users
│   │   ├── localUsers.ts   # Запросы к local_users (ученики)
│   │   └── ...
│   └── lib/                # Утилиты бэкенда
│       ├── env.ts          # Переменные окружения
│       ├── password.ts     # bcrypt хеширование паролей
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
│   │   ├── StudentProfile.tsx      # Личный кабинет ученика с вкладками
│   │   ├── LabPendulum.tsx, OhmsLawLab.tsx, ProjectileLab.tsx ...
│   │   └── admin/ProblemManagement.tsx   # Редактор базы задач (категории/темы/задачи)
│   │   └── admin/LabManagement.tsx   # Редактор лабораторий (категории/темы/работы/симуляции)
│   ├── components/         # React-компоненты
│   │   ├── Header.tsx
│   │   ├── AuthLayout.tsx
│   │   ├── lab/            # Компоненты лабораторных работ
│   │   │   ├── LabControls.tsx
│   │   │   ├── LabLayout.tsx
│   │   │   ├── LabSidebar.tsx
│   │   │   ├── ResultsTable.tsx
│   │   │   ├── SimulationCanvas.tsx
│   │   │   ├── SimulationWrapper.tsx  # обвязка «своих» симуляций
│   │   │   └── simulations/           # реестр и компоненты симуляций
│   │   │       ├── types.ts
│   │   │       ├── registry.ts
│   │   │       ├── UniformLinearMotion.tsx
│   │   │       ├── UniformLinearMotion.manifest.ts
│   │   │       ├── UniformlyAcceleratedMotion.tsx
│   │   │       ├── UniformlyAcceleratedMotion.manifest.ts
│   │   │       └── ExternalIframeSimulation.tsx
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
│   │   ├── content.ts      # topic_nodes, resources (единственный источник структуры курса)
│   │   ├── learning.ts     # enrollments, student_progress, lab_progress
│   │   ├── labs.ts         # Виртуальные лаборатории + реестр симуляций
│   │   ├── problems.ts     # Банк задач
│   │   ├── jupyter.ts      # Notebook Management
│   │   ├── notifications.ts
│   │   ├── timeline.ts
│   │   ├── audit.ts
│   │   ├── media.ts
│   │   └── index.ts        # Реэкспорт всех доменов
│   ├── schema.ts           # Реэкспорт schema/ для обратной совместимости
│   ├── relations/          # Доменные Drizzle-отношения
│   ├── relations.ts        # Реэкспорт relations/
│   ├── seed.ts             # Начальные данные (topic_nodes, resources)
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
APP_SECRET=               # Секрет для подписи JWT (админы и ученики)

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
5. Создать первого администратора напрямую в БД (админы не создаются через сайт):
   ```sql
   INSERT INTO admin_users (login, password_hash, name, role, status)
   VALUES ('admin', '$2a$12$...', 'Administrator', 'admin', 'active');
   ```
   Пароль должен быть bcrypt-хешем. Сгенерировать хеш можно в Node:
   ```js
   const bcrypt = require('bcryptjs');
   console.log(await bcrypt.hash('your-password', 12));
   ```
6. Запустить dev: `npm run dev`
6. Открыть http://localhost:3000

> **Миграции не используются.** Проект разрабатывается только на этом локальном ПК. Локальная база данных — единственный источник правды. Когда сайт будет готов, мы просто экспортируем локальную БД в том виде, в каком она есть, и импортируем её на хост через PHPMyAdmin. Не нужно тратить время на аккуратные миграции или синхронизацию схемы: при необходимости проще пересоздать локальную базу (`db:push`) и заполнить сидами заново.

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

Аутентификация полностью локальная; OAuth/Kimi Platform больше не используется.

1. **Администраторы** — таблица `admin_users`:
   - Логин/пароль (bcrypt)
   - Сессия в httpOnly cookie (`admin_session`)
   - Роль: `admin`

2. **Ученики** — таблица `local_users`:
   - Логин/пароль (bcrypt)
   - Сессия в httpOnly cookie (`student_session`)
   - Роль: `student`

Единый endpoint входа — `unifiedAuth.login`. Он сначала ищет логин в `admin_users`, затем в `local_users`, и выдаёт соответствующую cookie.

### tRPC-роутеры и middleware

| Процедура | Описание |
|-----------|----------|
| `publicQuery` | Без авторизации |
| `authedQuery` | Любая аутентификация (admin или student) |
| `adminQuery` | Требуется роль `admin` |
| `studentQuery` | Требуется роль `student` |

### База данных (MySQL + Drizzle ORM)

Схема разбита на bounded contexts (домены) в `app/db/schema/`:

| Домен | Таблицы | Подключение |
|---|---|---|
| `auth` | `roles`, `permissions`, `role_permissions`, `admin_users`, `local_users` | `getAuthDb()` |
| `content` | `topic_nodes`, `resources` | `getContentDb()` |
| `learning` | `enrollments`, `student_progress`, `lab_progress` | `getLearningDb()` |
| `labs` | `lab_categories`, `lab_subcategories`, `lab_works`, `lab_blocks`, `lab_analytics`, `simulations` | `getLabsDb()` |
| `problems` | `problem_categories`, `problem_subcategories`, `problems` | `getProblemsDb()` |
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
- **Карточка** (`/labs/work/:slug`) имеет три вкладки: **Теория**, **Эксперимент**, **Вывод**. Вкладка «Вывод» доступна только авторизованным пользователям.
- Каждая карточка имеет **тип** (`lab_works.card_type`): `own` или `external`.
  - `own` — используется одна из «своих» симуляций с полной обвязкой (параметры, управление, текущие величины, измерения, графики).
  - `external` — встраивается сторонняя симуляция (PhET/iframe) без обвязки.

### Карточка лабораторной работы

Страница `LabWorkPage.tsx` рендерит:

- **Теория** — цель работы, теоретические сведения, оборудование.
- **Эксперимент** — пошаговая инструкция и `SimulationWrapper`, который собирает карточку симуляции из блоков обвязки.
- **Вывод** — текстовая панель с сохранением/отправкой прогресса.

### Обвязка «своей» симуляции

«Свои» (own) симуляции не встраиваются голым canvas: каждая симуляция поставляется вместе с собственной обвязкой. Обвязка рендерится компонентом `SimulationWrapper` (`src/components/lab/SimulationWrapper.tsx`) и состоит из блоков:

1. **Параметры** — слайдеры/числа/селекты из манифеста симуляции.
2. **Управление** — кнопки «Старт» и «Сброс».
3. **Симуляция** — canvas с физической визуализацией.
4. **Текущие величины** — карточки значений, которые симуляция передаёт через `onStateChange`.
5. **Измерения** — таблица с кнопкой «Зафиксировать».
6. **Графики** — строятся по накопленным измерениям (можно отключить через `hasGraphs: false`).

Названия блоков задаются в манифесте симуляции (`wrapper.blockTitles`).

### Реестр симуляций

В системе два вида симуляций:

- **«Свои» (`own`)** — полноценные интерактивные симуляции с обвязкой (параметры, управление, измерения, графики). Регистрируются в коде.
- **Встраиваемые (`external`)** — сторонние симуляции по ссылке (PhET, Electricity Maps и др.), отображаются через iframe. Управляются через админку `/admin/simulations`.

#### Реестр «своих» симуляций

«Свои» симуляции регистрируются в коде:

- `src/components/lab/simulations/types.ts` — общие типы (`SimulationManifest`, `SimParamConfig`, `GraphConfig` и др.).
- `src/components/lab/simulations/registry.ts` — реестр компонентов, манифестов и функций измерений.
- `src/components/lab/simulations/<Name>.tsx` — React-компонент визуализации (только `default export`).
- `src/components/lab/simulations/<Name>.manifest.ts` — манифест симуляции и функция `computeXxxMeasurement`.
- `db/simulations-seed.ts` — заполнение таблицы `simulations` **только для `own`-симуляций**.

#### Реестр встраиваемых (`external`) симуляций

Встраиваемые лаборатории создаются, редактируются и удаляются через админ-страницу `/admin/simulations`. Для них автоматически устанавливается:

- `kind = "external"`
- `componentRef = "external-iframe"`
- `config` содержит один параметр `url`

Таблица `simulations` содержит мета-информацию и параметры, используемые админкой и внешними симуляциями:

| Поле | Назначение |
|------|-----------|
| `slug` | Уникальный идентификатор |
| `title` | Название для админки |
| `description` | Описание |
| `category` | Раздел физики |
| `source` | Источник симуляции (PhET, Electricity Maps и т.п.; для `own` — обычно `null` или `own`) |
| `componentRef` | Ключ в `registry.ts` для `own`; `"external-iframe"` для `external` |
| `kind` | `own` — своя симуляция с обвязкой; `external` — iframe стороннего ресурса |
| `isDynamic` | Нужна ли анимация (кнопка Старт/Сброс) |
| `config` | JSON с параметрами симуляции (`SimulationParamConfig[]`) |
| `isActive` | Видна ли симуляция в списке выбора |

Сторонние (`external`) симуляции не используют обвязку: для них `SimulationWrapper` рендерит iframe и поле заметок.

### Lab Management

Админ-страница `/admin/lab-management` объединяет управление:
- разделами (`lab_categories`)
- темами (`lab_subcategories`)
- лабораторными работами (`lab_works`)
- выбором симуляции из реестра (`simulations`)

Отдельная админ-страница `/admin/simulations` предназначена для управления встраиваемыми (`external`) симуляциями: создание, редактирование, удаление по ссылке. «Свои» (`own`) симуляции отображаются в этом реестре только для просмотра.

Параметры «своей» симуляции задаются в её манифесте и дублируются в `simulations.config` для отображения в админке. При подключении симуляции к работе обвязка подставляется автоматически.

Теоретическая часть пишется в Markdown (редактор `@uiw/react-md-editor`) с поддержкой формул и картинок. Картинки загружаются через `/api/upload/image` и вставляются в Markdown.

### Связь работы и симуляции

Поле `lab_works.simulationSlug` — soft-link на `simulations.slug`. Поле `lab_works.cardType` определяет, как именно отображается симуляция:

- `cardType = "own"` — `LabWorkPage.tsx` через `SimulationWrapper` находит зарегистрированную симуляцию в `simulationRegistry` по `simulation.componentRef` и рендерит её вместе с обвязкой.
- `cardType = "external"` — `SimulationWrapper` рендерит iframe стороннего ресурса и поле заметок.

В `LabManagement` тип карточки выбирается отдельно, и список доступных симуляций фильтруется по этому типу.

### Добавление новой «своей» симуляции

1. Создать `src/components/lab/simulations/<Name>.tsx` с React-компонентом.
2. Создать `src/components/lab/simulations/<Name>.manifest.ts` с `xxxManifest` и `computeXxxMeasurement`.
3. Зарегистрировать симуляцию в `src/components/lab/simulations/registry.ts`.
4. Добавить seed-запись в `db/simulations-seed.ts` (только для `own`-симуляций).
5. Запустить `npx tsx db/simulations-seed.ts`.

Подробный формат описан в `docs/simulation-generation-prompt.md`.

### Добавление новой встраиваемой (`external`) лаборатории

1. Открыть `/admin/simulations`.
2. Нажать «Добавить».
3. Заполнить поля: slug, название, описание, категория физики, источник, URL.
4. Сохранить.
5. Перейти в `/admin/lab-management`, создать или отредактировать lab work с `cardType = "external"` и выбрать созданную симуляцию.

Backup старых external-URL: `docs/external-labs-urls-backup.md`.

---

## Архитектура задач (Problem Management)

Задачи доступны **только администратору** и не публикуются на главном сайте. Структура повторяет лабораторные работы:

- **Раздел** (`problem_categories`)
- **Тема** (`problem_subcategories`)
- **Задача** (`problems`)

Админ-страница `/admin/problems` (`src/pages/admin/ProblemManagement.tsx`) предоставляет дерево навигации и редактор:
- Markdown-редактор `@uiw/react-md-editor` для условия, решения и ответа.
- Загрузка картинок через `/api/upload/image`.
- Галерея уже загруженных изображений (`trpc.admin.listImages`).

### Назначение задач ученикам

Аналогично лабораторным работам, задачи назначаются внутри записи на курс (`enrollments`) через таблицу `assigned_problems` (`learning` domain). Управление назначением находится на странице `/admin/enrollments` (`EnrollmentManagement.tsx`), компонент `AssignedProblemsManager`.

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
| `/login` | Вход для администратора | Публичный |
| `/profile` | Профиль администратора | Требуется admin |
| `/admin/problems` | Problem Management | Требуется admin |
| `/student/login` | Вход для ученика | Публичный |
| `/student/profile` | Личный кабинет ученика (дашборд) | Требуется ученик |
| `/student/notebook/:assignmentId` | Сдача Jupyter-ноутбука | Требуется ученик |
| `/student/labs` | Протоколы лабораторных | Требуется ученик |

---

## Архитектура назначенных Jupyter-ноутбуков

Повторяет схему задач и лабораторных работ:

- **Хранилище ноутбуков** — таблица `jupyter_notebooks` (домен `jupyter`). Файлы `.ipynb` хранятся на диске в `uploads/jupyter/`. Notebook Management (`JupyterNotebookManagement.tsx`) используется только для загрузки/удаления файлов и выбора подраздела.
- **Назначение** — единственный способ дать ученику доступ к ноутбуку. Таблица `assigned_jupyter_notebooks` (домен `learning`), связана с `enrollments`. При назначении ученику автоматически добавляется запись в `jupyter_notebook_access`, чтобы работал существующий endpoint `/api/jupyter/download/:id`.
- **Назначение в админке** — `EnrollmentManagement.tsx` → `AssignedJupyterNotebooksManager`, роутеры `enrollment.assignJupyterNotebook` / `unassignJupyterNotebook` / `updateAssignedJupyterNotebook`.
- **Ученик** видит назначенные ноутбуки во вкладке «Мои Тетради» (`StudentNotebooksSection.tsx`) и на странице `/student/notebook/:assignmentId` (`StudentNotebookPage.tsx`). Может скачать ноутбук или открыть его в Google Colab (скачивание + ссылка на colab.research.google.com), а затем отправить ссылку на выполненную работу (`student.submitJupyterNotebookSolution`).
- **Проверка** — отправленные ноутбуки попадают в `SubmissionsReview.tsx` с типом `jupyter_notebook`. Преподаватель открывает ссылку на Colab и выставляет оценку через `admin.gradeSubmission`.

---

## Соглашения по разработке

### Именование

- Компоненты React: PascalCase (`Header.tsx`, `StudentDashboard.tsx`)
- Хуки: camelCase с префиксом `use` (`useAuth`, `useStudentAuth`)
- Роутеры tRPC: суффикс `-router.ts` (`unified-auth-router.ts`, `student-router.ts`)
- Запросы к БД: суффикс `s.ts` в `queries/` (`localUsers.ts`, `adminUsers.ts`)

### Аутентификация в tRPC

- Для защиты эндпоинта используй `authedQuery`, `adminQuery` или `studentQuery` из `api/middleware.ts`
- В admin endpoints используй `ctx.adminUser`; в student endpoints — `ctx.localUser`
- Никогда не доверяй `ctx.adminUser` или `ctx.localUser` без middleware
- Администраторы создаются и управляются **только через БД** (`admin_users`); страница Student Management предназначена только для учеников (`local_users`)

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

- `APP_SECRET` используется для подписи **всех** JWT-токенов (`admin_session` и `student_session`)
- Сессионные cookie: `httpOnly`, `secure` (в production), `sameSite: "None"` (в production) / `"Lax"` (localhost)
- Пароли администраторов и учеников хешируются bcrypt (cost factor 12)
- Тело запроса ограничено 50 МБ (`bodyLimit`)
- Первый администратор создаётся вручную в БД (`admin_users`) или через вспомогательный скрипт

---

## Полезные скрипты

| Файл | Назначение |
|------|-----------|
| `db/seed.ts` | Полный сид начальных данных (темы, подтемы, лабы, ресурсы) |
| `db/simulations-seed.ts` | Реестр физических симуляций |
| `db/problems-seed.ts` | Сид задач |
| `scripts/create-student-tables.mjs` | Устаревший скрипт создания таблиц учеников |
| `make-admin.cjs` | Устаревший скрипт для OAuth admin |
| `create_tables.cjs` | Устаревший скрипт создания таблиц |

---

## Язык проекта

- Основной язык интерфейса: **русский**
- Код и комментарии: русский/английский (смешанно)
- Названия переменных: camelCase на английском
- Документация пользователя: `ЗАПУСК.md` (русский)
