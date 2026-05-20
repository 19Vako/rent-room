# Rent Room

## Стек

| Технологія | Призначення |
| --- | --- |
| Next.js 16 | App Router, SSR / SSG / client-side UI |
| React 19 | UI-компоненти |
| TypeScript | Типізація і безпека коду |
| Tailwind CSS 4 | Стилі та адаптивна верстка |
| NextAuth.js | Аутентифікація і авторизація |
| MongoDB | Зберігання користувачів, кімнат та бронювань |
| UploadThing | Завантаження фото для кімнат |
| Zustand | Клієнтський стан для фільтрів і налаштувань |
| Jest + Testing Library | Юніт-тести та інтеграції |

## Швидкий старт

1. Встановіть залежності:

```bash
pnpm install
```

2. Скопіюйте файл оточення:

```bash
cp .env.example .env
```

3. Заповніть значення змінних оточення в `.env`.

4. Запустіть локально:

```bash
pnpm dev
```

5. Відкрийте в браузері: `http://localhost:3000`

## Конфігурація

| Змінна | Опис |
| --- | --- |
| `MONGODB_URI` | URI підключення до MongoDB |
| `DB_NAME` | Імʼя бази даних |
| `AUTH_GOOGLE_ID` | Google OAuth client ID |
| `AUTH_GOOGLE_SECRET` | Google OAuth client secret |
| `ADMIN_EMAIL` | Email адміністратора |
| `ORGANIZATION_EMAIL` | Email для відправки листів |
| `ORGANIZATION_EMAIL_PASS` | Пароль або токен для email |
| `NEXT_PUBLIC_APP_URL` | Базовий URL додатка |

> Роль `ADMIN` визначається по email з `ADMIN_EMAIL`.

## Структура

| Папка | Опис |
| --- | --- |
| `app/` | Сторінки, layout, UI-компоненти |
| `app/api/` | API-роути, включно з UploadThing і NextAuth |
| `auth/` | Конфігурація NextAuth та аутентифікація |
| `lib/` | Підключення до MongoDB і серверні дії |
| `src/lib/actions/` | Бізнес-логіка для користувачів, кімнат, бронювань |
| `src/types/` | Інтерфейси та типи даних |
| `src/store/` | Zustand стан |
| `public/` | Статичні файли |

## Реалізовані фічі

- Email/password логін — вхід та автоматична реєстрація через credentials
- Google Login — OAuth авторизація через Google
- Ролі ADMIN / GUEST — доступ до захищених admin-маршрутів
- Кімнати — створення, редагування, перегляд кімнат
- Фото кімнат — завантаження з UploadThing
- Пошук / фільтрація — пошук та сортування списку кімнат
- Бронювання — створення замовлень і перегляд історії
- Відновлення пароля — надсилання листа та зміна пароля
- Тести — серверні тести для логіки MongoDB

## Архітектура

| Компонент | Призначення |
| --- | --- |
| NextAuth | Увійти/вийти, JWT-сесія, роль користувача |
| MongoDB Adapter | Зберігання користувачів та акаунтів |
| JWT сесія | Зберігає `id` та `role` в cookie |
| UploadThing | Захищене завантаження фото для адміну |
| Server Actions | Виконання бізнес-логіки на сервері |
| Middleware `proxy.ts` | Перенаправлення на /login і захист маршрутів |

## Endpoint-карта

### Сторінки

| Шлях | Опис |
| --- | --- |
| `/` | Головна сторінка з переліком кімнат |
| `/auth/login` | Вхід / реєстрація користувача |
| `/auth/forgot-password` | Запит на скидання пароля |
| `/auth/forgot-password/reset-password` | Форма введення нового пароля |
| `/guestProfile` | Профіль гостя |
| `/room/[id]` | Детальна сторінка кімнати |
| `/admin` | Адмінська панель |
| `/admin/create-room` | Створення кімнати |
| `/admin/edit-room/[id]` | Редагування кімнати |

### API

| Метод | Шлях | Опис |
| --- | --- | --- |
| `POST` | `/api/auth/*` | NextAuth endpoints для логіну/сесії |
| `GET` | `/api/uploadthing` | Завантаження файлів UploadThing |
| `POST` | `/api/uploadthing` | Завантаження фото кімнат |

### Серверні дії

| Файл | Опис |
| --- | --- |
| `src/lib/actions/room.actions.ts` | Логіка роботи з кімнатами |
| `src/lib/actions/order.actions.ts` | Логіка бронювань і замовлень |
| `src/auth/actions/auth.actions.ts` | Скидання та зміна пароля |
| `src/lib/actions/user.actions.ts` | Створення/пошук користувача, logout |

## Команди

| Команда | Призначення |
| --- | --- |
| `pnpm dev` | Запуск дев-сервера |
| `pnpm build` | Збірка проєкту |
| `pnpm start` | Запуск production-збірки |
| `pnpm lint` | Аналіз ESLint |
| `pnpm format` | Запуск Prettier |
| `pnpm test` | Запуск Jest тестів |
