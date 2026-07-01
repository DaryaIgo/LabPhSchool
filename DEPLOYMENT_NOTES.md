# Памятка по развёртыванию nebuls.ru

## Готовые файлы для загрузки

Все файлы для публикации собраны в `deploy/`:

- `deploy-nebuls.tar.gz` — собранный сайт (фронтенд + бэкенд + настройки);
- `labphschool-nebuls-clean.sql` — дамп базы данных (только контент и админ, без тестовых учеников и логов).

## Что входит в архив сайта

```
deploy-nebuls.tar.gz
└── app/
    ├── dist/
    │   ├── boot.cjs          # собранный бэкенд (Hono + tRPC)
    │   └── public/           # собранный фронтенд (React + Vite)
    ├── .env.production       # переменные окружения для nebuls.ru
    ├── .htaccess             # настройки Passenger
    └── tmp/
        └── restart.txt       # триггер перезапуска Passenger
```

`node_modules` в архив не входят — бэкенд собран в один файл `dist/boot.cjs`.

## Пошаговая инструкция по публикации на SprintHost

### 1. Создать базу данных

В панели SprintHost создать базу данных:

- **Имя базы:** `darigoshin_nebuls_base`
- **Пользователь:** `darigoshin_nebuls_base`
- **Пароль:** `TaqwcNvt4gDEAQ`

Эти реквизиты уже прописаны в `.env.production` внутри архива.

### 2. Импортировать базу данных

1. Открыть PHPMyAdmin.
2. Выбрать базу `darigoshin_nebuls_base`.
3. Перейти на вкладку **«Импорт»**.
4. Выбрать файл `labphschool-nebuls-clean.sql`.
5. Нажать **«Вперёд»**.

Дамп создаёт все таблицы и заполняет:

- роли и администратора (`roles`, `admin_users`);
- структуру курса (`topic_nodes`, `resources`);
- каталог лабораторных работ (`lab_categories`, `lab_subcategories`, `lab_works`, `lab_blocks`);
- реестр симуляций (`simulations`);
- таймлайн (`timeline_entries`).

Тестовые ученики, их прогресс, назначения, уведомления и audit-лог в дамп не входят.

### 3. Загрузить и распаковать сайт

1. Загрузить `deploy-nebuls.tar.gz` в `public_html` домена `nebuls.ru`.
2. Распаковать архив так, чтобы папка `app/` оказалась по пути:

   ```
   /home/darigoshin/domains/nebuls.ru/app/
   ```

3. Скопировать файл `.htaccess` из `app/` в `public_html/`:

   ```
   /home/darigoshin/domains/nebuls.ru/public_html/.htaccess
   ```

4. Убедиться, что в `public_html/.htaccess` прописан путь:

   ```apache
   PassengerAppRoot /home/darigoshin/domains/nebuls.ru/app
   ```

### 4. Перезапуск Passenger

Файл `app/tmp/restart.txt` в архиве должен инициировать перезапуск. Если сайт не открылся:

1. Подождать 20–30 секунд.
2. В файловом менеджере обновить время у `app/tmp/restart.txt` (например, открыть и сохранить).
3. Ещё раз подождать.

### 5. Проверка после публикации

- Главная страница `https://nebuls.ru` должна открываться.
- Вход в админку по логину `admin` и текущему паролю от локальной версии.
- Разделы курса и лабораторные работы должны отображаться.

Если что-то не работает:

1. Очистить куки и кэш браузера.
2. Открыть F12 → Console и Network.
3. Проверить, не падают ли запросы к `/api/trpc/`.
4. Посмотреть логи Passenger в панели управления SprintHost.

## Ограничения хостинга

На SprintHost нет SSH-доступа для запуска команд. Все изменения вносятся только через:

- файловый менеджер (загрузка/распаковка архива);
- PHPMyAdmin (импорт SQL).

## Текущая структура базы данных

Одна база данных `darigoshin_nebuls_base`. Основные таблицы:

| Таблицы | Назначение |
|---|---|
| `admin_users`, `local_users`, `roles` | Администраторы, ученики, роли |
| `topic_nodes`, `resources` | Структура курса и материалы |
| `lab_categories`, `lab_subcategories`, `lab_works`, `lab_blocks` | Каталог лабораторных работ |
| `simulations` | Реестр физических симуляций |
| `problem_categories`, `problem_subcategories`, `problems` | Банк задач (админка) |
| `enrollments`, `assigned_lab_works`, `assigned_problems`, `assigned_jupyter_notebooks` | Назначения ученикам |
| `student_progress`, `lab_progress` | Прогресс учеников |
| `jupyter_notebooks`, `jupyter_notebook_access` | Jupyter-ноутбуки |
| `timeline_entries` | Таймлайн учёных и открытий |
| `images` | Загруженные через админку картинки |
| `audit_log`, `notifications`, `page_visits` | Логи, уведомления, аналитика |

Между доменами нет жёстких внешних ключей на уровне приложения — связи через soft-ссылки.

## Обновление сайта в будущем

1. Локально выполнить `npm run build`.
2. Сделать свежий дамп базы (`mysqldump`) — если изменялась схема или контент.
3. Повторить шаги 2–4.

Если менялся только код, без изменений в БД, можно обойтись только загрузкой нового архива.
