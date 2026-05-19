# Каталог картин

## Стек

- Backend: C# / ASP.NET Core
- Frontend: HTML, CSS, JavaScript
- Хранение данных: JSON-файл

## Текущий этап

Проект находится на этапе ранней разработки. Сейчас добавлены:

- базовая структура backend и frontend;
- backend на ASP.NET Core 9;
- CRUD API для картин;
- хранение данных в `backend/PaintingsCatalog.Api/Data/paintings.json`;
- публичный список картин, который рендерится из мок-данных в JavaScript;
- детальная страница картины с заполнением по `id` из адресной строки;
- отдельная папка открытой админки;
- админская таблица, которая рендерится из тех же мок-данных;
- страницы админки для добавления и редактирования;
- базовые обработчики форм, категорий и удаления на фронтенде;
- `.gitignore` для C#, IDE, сборочных и временных файлов.

Frontend пока не подключен к API. Это следующий этап разработки.

## Как проверить frontend

Пока frontend работает как статический прототип с мок-данными в `frontend/js/app.js`.

Можно открыть страницы напрямую в браузере:

```text
frontend/index.html
frontend/details.html?id=1
frontend/admin/index.html
frontend/admin/edit.html?id=1
```

## Как запустить backend

```bash
cd backend/PaintingsCatalog.Api
dotnet run
```

После запуска API будет доступен локально по адресу, который выведет `dotnet run`.

Основные API-адреса:

```text
GET    /api/paintings
GET    /api/paintings/{id}
POST   /api/paintings
PUT    /api/paintings/{id}
DELETE /api/paintings/{id}
```

Пример тела запроса для создания или редактирования:

```json
{
  "title": "Девятый вал",
  "artist": "Иван Айвазовский",
  "year": 1850,
  "category": "Морские виды",
  "description": "Описание картины",
  "previewClass": "preview-sea"
}
```
