namespace PaintingsCatalog.Api.Models;

public sealed record Painting(
    int Id,
    string Title,
    string Artist,
    int Year,
    string Category,
    string Description,
    string PreviewClass
);
