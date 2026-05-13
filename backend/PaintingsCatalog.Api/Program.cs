var builder = WebApplication.CreateBuilder(args);

var app = builder.Build();

app.MapGet("/", () => Results.Ok(new
{
    Project = "Paintings Catalog API",
    Status = "Started"
}));

app.MapGet("/api/paintings", () => Results.Ok(Array.Empty<object>()));

app.Run();
