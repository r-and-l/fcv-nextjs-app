# ⚽ AiFC (Telegram Mini App)

AiFC — это современное премиальное веб-приложение (Telegram Mini App), разработанное на стекe Next.js, Tailwind CSS и Prisma/PostgreSQL. Оно предназначено для удобного управления футбольными командами, планирования тренировок/игр и автоматического распределения составов с возможностью проведения мини-турниров прямо в интерфейсе Telegram.

---

## 🌟 Основные возможности

### 🤖 Интеграция с Telegram
- **Автоматическая регистрация команды:** При добавлении бота в групповой чат создается профиль команды, а пользователь, добавивший бота, автоматически назначается администратором.
- **Интерактивные сборы:** Бот публикует анонсы игр в чат с inline-кнопками «✅ Иду» / «❌ Не иду».
- **Мгновенная синхронизация:** Список записавшихся игроков в реальном времени отображается в закрепленном сообщении чата и синхронизируется с приложением.

### 🏃 Профили и управление составом
- **Ролевая модель:** Поддержка ролей `ADMIN` (Администратор чата/создатель), `COACH` (Тренер, может управлять составами) и `MEMBER` (Игрок).
- **Карточки игроков:** Игровой профиль с указанием позиции (вратарь, защитник, полузащитник, нападающий, универсал) и номера телефона.
- **Гостевые игроки (Легионеры):** Возможность добавлять в составы сторонних игроков («Легионеров»), не зарегистрированных в Telegram.

### 📅 Расписание и автогенерация
- **Гибкое расписание:** Настройка регулярных игр по дням недели, времени, месту проведения и длительности.
- **Автогенерация матчей (Cron):** Автоматическое создание игр за 72 часа до начала согласно расписанию с отправкой анонса в чат.
- **Персонализированные напоминания:** Автоматическая отправка уведомлений о сборах в чат за заданное время до игры (например, за 24 часа) с настраиваемым текстом.

### 👥 Конструктор составов & Режим турнира
- **Распределение по командам:** Удобное распределение записавшихся игроков по составам (по умолчанию генерируются две команды: «Красные» и «Зелёные»).
- **Режим Турнира (3+ состава):** Автоматически активируется при создании 3 и более составов.
  - **Круговая сетка:** Генерация расписания мини-матчей по круговой системе на основе общей длительности игры.
  - **Турнирная таблица:** Автоматический расчет очков, побед, ничьих, поражений, забитых/пропущенных голов в реальном времени.
  - **Панель результатов:** Удобный ввод результатов каждого мини-матча с пересчетом таблицы.

---

## 🛠️ Технологический стек

<p align="left">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Telegram_Bot_API-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white" alt="Telegram" />
</p>

- **Frontend & Backend:** Next.js (App Router, React 19)
- **Стилизация:** Tailwind CSS (v4)
- **База данных:** PostgreSQL
- **ORM:** Prisma Client
- **Telegram Интеграция:** Telegram Web App SDK (`@twa-dev/sdk`), Telegram Bot API
- **Запросы и кэширование:** SWR (Stale-While-Revalidate)

---

## 🚀 Быстрый запуск

### 1. Клонирование и установка зависимостей
```bash
git clone <repository_url>
cd aifc-nextjs-app
npm install
```

### 2. Настройка окружения
Создайте файл `.env.local` в корне проекта на основе `.env.example`:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/aifc"
DIRECT_URL="postgresql://username:password@localhost:5432/aifc"
TELEGRAM_BOT_TOKEN="your_telegram_bot_token"
NEXT_PUBLIC_MINI_APP_SHORT_NAME="app"
CRON_SECRET="your_secure_cron_secret"
```

### 3. Накатывание миграций БД
Сгенерируйте клиент Prisma и примените схему:
```bash
npx prisma db push
```

### 4. Запуск в режиме разработки
```bash
npm run dev
```
Приложение будет доступно по адресу [http://localhost:3000](http://localhost:3000).

---

## 🤖 Настройка Telegram Бота

1. Создайте бота через [@BotFather](https://t.me/BotFather) и получите `TELEGRAM_BOT_TOKEN`.
2. В настройках бота в BotFather:
   - Включите **Inline Mode** (`/setinline`).
   - Создайте **Mini App** (`/newapp`), привяжите его к вашему боту, укажите Web App URL (для разработки можно использовать тоннель ngrok/Cloudflare, например `https://xxxx.ngrok-free.app`).
   - Укажите короткое имя Mini App в `NEXT_PUBLIC_MINI_APP_SHORT_NAME`.
3. Зарегистрируйте Webhook для получения обновлений от Telegram. Вы можете вызвать GET-запрос:
   ```
   https://ваша-ссылка-на-деплой.vercel.app/api/setup-webhook
   ```
   *Замечание: Убедитесь, что в этот момент бот имеет доступ к вебхуку.*

---

## ⏰ Настройка Cron-задач

Приложение предоставляет два endpoint'а для автоматизации процессов (защищены токеном `CRON_SECRET` в заголовке `Authorization: Bearer <CRON_SECRET>`):

1. **Автогенерация игр по расписанию:**
   - **GET** `/api/cron/generate-games`
   - Проверяет расписание команд и создает игры на ближайшие 7 дней, если до игры осталось менее 72 часов.

2. **Отправка напоминаний:**
   - **GET** `/api/cron/send-reminders`
   - Рассылает напоминания о сборах в соответствующие чаты Telegram, согласно настройкам каждой игры.

Рекомендуется настроить планировщик (например, Vercel Cron, GitHub Actions или системный cron) на вызов этих URL с периодичностью раз в 10–30 минут.

---

## 📸 Скриншоты интерфейса

В этой секции представлены ключевые экраны приложения. Скриншоты можно разместить в папке `public/screenshots/`.

<div align="center">
  <h3>📱 Главный экран и список команд</h3>
  <img src="public/screenshots/dashboard.jpg" alt="Главный экран" width="300" style="border-radius: 12px; margin-bottom: 20px; border: 1px solid #e4e4e7;"/>
  <p><i>Список команд пользователя и быстрый переход в личный профиль футболиста.</i></p>

  <br/>

  <h3>🏃 Страница команды и карточка игрока</h3>
  <img src="public/screenshots/team_home.jpg" alt="Страница команды" width="300" style="border-radius: 12px; margin-bottom: 20px; border: 1px solid #e4e4e7;"/>
  <p><i>Информация о текущей команде, список предстоящих игр с вашим статусом и кнопка настройки профиля.</i></p>

  <br/>

  <h3>👥 Конструктор составов (Lineups Builder)</h3>
  <img src="public/screenshots/lineups_builder.jpg" alt="Конструктор составов" width="300" style="border-radius: 12px; margin-bottom: 20px; border: 1px solid #e4e4e7;"/>
  <p><i>Удобный интерфейс для тренеров и админов: перетаскивание игроков из списка записавшихся в составы команд («Красные» / «Зелёные»), а также добавление легионеров.</i></p>

  <br/>

  <h3>🏆 Режим турнира: Таблица и Матчи (3+ команды)</h3>
  <div style="display: flex; justify-content: center; gap: 15px; flex-wrap: wrap;">
    <div style="text-align: center;">
      <img src="public/screenshots/tournament_standings.jpg" alt="Турнирная таблица" width="280" style="border-radius: 12px; border: 1px solid #e4e4e7;"/>
      <p><i>Динамическая таблица кругового турнира</i></p>
    </div>
    <div style="text-align: center;">
      <img src="public/screenshots/tournament_matches.jpg" alt="Список матчей" width="280" style="border-radius: 12px; border: 1px solid #e4e4e7;"/>
      <p><i>Сетка матчей с вводом результатов</i></p>
    </div>
  </div>

  <br/>

  <h3>⚙️ Настройки администрирования</h3>
  <img src="public/screenshots/admin_settings.jpg" alt="Панель администратора" width="300" style="border-radius: 12px; margin-bottom: 20px; border: 1px solid #e4e4e7;"/>
  <p><i>Раздел настроек расписания регулярных игр, ручного создания игр и настройки текста автоматических напоминаний.</i></p>

  <br/>

  <h3>💬 Интеграция в Telegram чате</h3>
  <img src="public/screenshots/telegram_rsvp.jpg" alt="Анонс игры в Telegram" width="400" style="border-radius: 12px; margin-bottom: 20px; border: 1px solid #e4e4e7;"/>
  <p><i>Анонс игры и сбор участников в групповом чате с кнопками быстрого ответа и перехода в Mini App.</i></p>
</div>

*Примечание: Если вы хотите обновить скриншоты, сделайте снимки экрана приложения в мобильной версии Telegram и сохраните их в директорию `public/screenshots/` под указанными выше именами.*

---

## 📂 Структура проекта

- `prisma/` — схема базы данных и файлы настроек Prisma
- `public/` — статичные файлы и скриншоты
- `src/app/` — роутинг Next.js (App Router) и API-маршруты
- `src/components/` — UI-компоненты (делятся по модулям: admin, archive, lineups, layout, ui и др.)
- `src/hooks/` — кастомные React-хуки для работы с SWR (useTeamData, useProfile, useSchedules и др.)
- `src/lib/` — вспомогательные библиотеки (Telegram API, валидация Web App, форматирование дат, Prisma Client)
- `src/services/` — бизнес-логика серверной части (gameService, teamService, userService)
- `src/types/` — типы TypeScript
