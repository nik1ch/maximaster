using PaintingsCatalog.Api.Models;
using PaintingsCatalog.Api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy
            .AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddSingleton<PaintingRepository>();

var app = builder.Build();

app.UseCors();

app.MapGet("/", () => Results.Ok(new
{
    Project = "Paintings Catalog API",
    Status = "Started",
    Endpoints = new[]
    {
        "GET /api/paintings",
        "GET /api/paintings/{id}",
        "POST /api/paintings",
        "PUT /api/paintings/{id}",
        "DELETE /api/paintings/{id}"
    }
}));

app.MapGet("/api/paintings", async (PaintingRepository repository) =>
{
    var paintings = await repository.GetAllAsync();
    return Results.Ok(paintings);
});

app.MapGet("/api/paintings/{id:int}", async (int id, PaintingRepository repository) =>
{
    var painting = await repository.GetByIdAsync(id);
    return painting is null ? Results.NotFound() : Results.Ok(painting);
}).WithName("GetPaintingById");

app.MapPost("/api/paintings", async (PaintingRequest request, PaintingRepository repository) =>
{
    var validationError = ValidatePainting(request);

    if (validationError is not null)
    {
        return Results.BadRequest(new { error = validationError });
    }

    var painting = await repository.AddAsync(request);
    return Results.CreatedAtRoute("GetPaintingById", new { id = painting.Id }, painting);
});

app.MapPut("/api/paintings/{id:int}", async (int id, PaintingRequest request, PaintingRepository repository) =>
{
    var validationError = ValidatePainting(request);

    if (validationError is not null)
    {
        return Results.BadRequest(new { error = validationError });
    }

    var painting = await repository.UpdateAsync(id, request);
    return painting is null ? Results.NotFound() : Results.Ok(painting);
});

app.MapDelete("/api/paintings/{id:int}", async (int id, PaintingRepository repository) =>
{
    var isDeleted = await repository.DeleteAsync(id);
    return isDeleted ? Results.NoContent() : Results.NotFound();
});

app.Run();

static string? ValidatePainting(PaintingRequest request)
{
    if (string.IsNullOrWhiteSpace(request.Title))
    {
        return "Название картины обязательно.";
    }

    if (string.IsNullOrWhiteSpace(request.Artist))
    {
        return "Автор картины обязателен.";
    }

    if (request.Year < 1 || request.Year > DateTime.UtcNow.Year)
    {
        return "Год должен быть положительным числом не больше текущего года.";
    }

    if (string.IsNullOrWhiteSpace(request.Category))
    {
        return "Категория картины обязательна.";
    }

    if (string.IsNullOrWhiteSpace(request.Description))
    {
        return "Описание картины обязательно.";
    }

    return null;
}
