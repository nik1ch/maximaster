namespace PaintingsCatalog.Api.Models;

public sealed record PaintingRequest(
    string Title,
    string Artist,
    int Year,
    string Category,
    string Description,
    string? PreviewClass,
    string? ImageUrl
);
