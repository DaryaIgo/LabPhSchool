# Архитектура базы данных

## Общий принцип

База данных приложения `nebuls` разбита на **bounded contexts** (домены). Каждый домен содержит связанные таблицы, имеет собственный файл схемы и собственную точку подключения.

Физически на текущем хостинге SprintHost используется одна MySQL-база. Логическое разделение в коде позволяет:

- развивать домены независимо;
- избежать случайных cross-domain изменений;
- при необходимости легко перейти на отдельные базы данных через переменные окружения `DATABASE_URL_*`.

## Домены

| Домен | Файл схемы | Таблицы | Фабрика подключения |
|---|---|---|---|
| Auth / IAM | `app/db/schema/auth.ts` | `roles`, `permissions`, `role_permissions`, `users`, `local_users` | `getAuthDb()` |
| Content | `app/db/schema/content.ts` | `topics`, `subtopics`, `topic_nodes`, `labs`, `resources` | `getContentDb()` |
| Learning | `app/db/schema/learning.ts` | `enrollments`, `student_progress`, `lab_progress` | `getLearningDb()` |
| Labs | `app/db/schema/labs.ts` | `lab_categories`, `lab_subcategories`, `lab_works`, `lab_blocks`, `lab_simulation_params`, `lab_analytics` | `getLabsDb()` |
| Problems | `app/db/schema/problems.ts` | `problem_types`, `problems` | `getProblemsDb()` |
| Jupyter | `app/db/schema/jupyter.ts` | `jupyter_notebooks`, `jupyter_notebook_access` | `getJupyterDb()` |
| Notifications | `app/db/schema/notifications.ts` | `notifications` | `getNotificationsDb()` |
| Timeline | `app/db/schema/timeline.ts` | `timeline_entries` | `getTimelineDb()` |
| Audit | `app/db/schema/audit.ts` | `audit_log` | `getAuditDb()` |
| Media | `app/db/schema/media.ts` | `images` | `getMediaDb()` |

## Связи между доменами

Между доменами нет внешних ключей на уровне базы данных. Вместо них используются soft-ссылки:

| Таблица | Поле | Логически ссылается на |
|---|---|---|
| `local_users` | `created_by` | `auth.users.id` |
| `enrollments` | `local_user_id` | `auth.local_users.id` |
| `enrollments` | `topic_id` | `content.topics.id` |
| `enrollments` | `current_subtopic_id` | `content.subtopics.id` |
| `student_progress` | `local_user_id` | `auth.local_users.id` |
| `student_progress` | `subtopic_id` | `content.subtopics.id` |
| `lab_progress` | `local_user_id` | `auth.local_users.id` |
| `lab_progress` | `lab_work_id` | `labs.lab_works.id` |
| `problem_types` | `subtopic_id` | `content.subtopics.id` |
| `lab_works` | `topic_node_id` | `content.topic_nodes.id` |
| `jupyter_notebooks` | `subtopic_id` | `content.subtopics.id` |
| `jupyter_notebooks` | `uploaded_by` | `auth.users.id` |
| `jupyter_notebook_access` | `local_user_id` | `auth.local_users.id` |
| `jupyter_notebook_access` | `granted_by` | `auth.users.id` |
| `notifications` | `local_user_id` | `auth.local_users.id` |
| `topic_nodes` | `lab_category_slug` | `labs.lab_categories.slug` |

Целостность по этим ссылкам контролируется на уровне приложения.

## Подключения

Все фабрики находятся в `app/api/queries/connection.ts`. Каждая фабрика принимает URL из переменной окружения:

```ts
const db = getContentDb();
```

Переменные окружения:

- `DATABASE_URL` — основная строка подключения; используется всеми доменами по умолчанию.
- `DATABASE_URL_AUTH`, `DATABASE_URL_CONTENT`, `DATABASE_URL_LEARNING`, `DATABASE_URL_LABS`, `DATABASE_URL_PROBLEMS`, `DATABASE_URL_JUPYTER`, `DATABASE_URL_NOTIFICATIONS`, `DATABASE_URL_TIMELINE`, `DATABASE_URL_AUDIT`, `DATABASE_URL_MEDIA` — опциональные строки для отдельных баз.

## Миграции

Пока все таблицы физически находятся в одной базе, миграции генерируются и применяются единым набором:

```bash
npm run db:generate
npm run db:migrate
```

При переходе на физически разные базы для каждой базы потребуется отдельный конфиг `drizzle-kit` и отдельная папка миграций.

## Удалённые legacy-таблицы

В ходе рефакторинга удалены неиспользуемые таблицы:

- `progress`
- `lab_results`
