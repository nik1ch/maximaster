# Каталог картин

## Стек

- Backend: C# / ASP.NET Core
- Frontend: HTML, CSS, JavaScript
- Хранение данных: JSON-файл

## Текущий этап

Проект представляет собой законченный минимальный CRUD-каталог. Сейчас добавлены:

- базовая структура backend и frontend;
- backend на ASP.NET Core 9;
- CRUD API для картин;
- хранение данных в `backend/PaintingsCatalog.Api/Data/paintings.json`;
- публичный список картин, который загружает данные из API;
- детальная страница картины с загрузкой по `id`;
- отдельная папка открытой админки;
- админка для добавления, редактирования и удаления картин;
- изображения картин через ссылку или загрузку файла в форме админки;
- frontend на HTML, CSS и JavaScript без фреймворков;
- `.gitignore` для C#, IDE, сборочных и временных файлов.

## Как запустить проект

```bash
cd backend/PaintingsCatalog.Api
dotnet run
```

После запуска открой адрес, который выведет `dotnet run`, например:

```text
http://localhost:5000
```

Основные страницы:

```text
/                         каталог
/details.html?id=1        детальная страница
/admin                    админка
/admin/create.html        добавление картины
/admin/edit.html?id=1     редактирование картины
```

## API

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
  "previewClass": "preview-sea",
  "imageUrl": "https://example.com/painting.jpg"
}
```
