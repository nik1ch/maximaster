using System.Text.Json;
using PaintingsCatalog.Api.Models;

namespace PaintingsCatalog.Api.Services;

public sealed class PaintingRepository
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        WriteIndented = true
    };

    private readonly SemaphoreSlim _lock = new(1, 1);
    private readonly string _filePath;

    public PaintingRepository(IWebHostEnvironment environment)
    {
        _filePath = Path.Combine(environment.ContentRootPath, "Data", "paintings.json");
        Directory.CreateDirectory(Path.GetDirectoryName(_filePath)!);
    }

    public async Task<IReadOnlyList<Painting>> GetAllAsync()
    {
        await _lock.WaitAsync();

        try
        {
            return await ReadAllAsync();
        }
        finally
        {
            _lock.Release();
        }
    }

    public async Task<Painting?> GetByIdAsync(int id)
    {
        await _lock.WaitAsync();

        try
        {
            var paintings = await ReadAllAsync();
            return paintings.FirstOrDefault(painting => painting.Id == id);
        }
        finally
        {
            _lock.Release();
        }
    }

    public async Task<Painting> AddAsync(PaintingRequest request)
    {
        await _lock.WaitAsync();

        try
        {
            var paintings = await ReadAllAsync();
            var nextId = paintings.Count == 0 ? 1 : paintings.Max(painting => painting.Id) + 1;
            var painting = CreatePainting(nextId, request);

            paintings.Add(painting);
            await WriteAllAsync(paintings);

            return painting;
        }
        finally
        {
            _lock.Release();
        }
    }

    public async Task<Painting?> UpdateAsync(int id, PaintingRequest request)
    {
        await _lock.WaitAsync();

        try
        {
            var paintings = await ReadAllAsync();
            var index = paintings.FindIndex(painting => painting.Id == id);

            if (index < 0)
            {
                return null;
            }

            var updatedPainting = CreatePainting(id, request);
            paintings[index] = updatedPainting;
            await WriteAllAsync(paintings);

            return updatedPainting;
        }
        finally
        {
            _lock.Release();
        }
    }

    public async Task<bool> DeleteAsync(int id)
    {
        await _lock.WaitAsync();

        try
        {
            var paintings = await ReadAllAsync();
            var removedCount = paintings.RemoveAll(painting => painting.Id == id);

            if (removedCount == 0)
            {
                return false;
            }

            await WriteAllAsync(paintings);
            return true;
        }
        finally
        {
            _lock.Release();
        }
    }

    private static Painting CreatePainting(int id, PaintingRequest request)
    {
        return new Painting(
            id,
            request.Title.Trim(),
            request.Artist.Trim(),
            request.Year,
            request.Category.Trim(),
            request.Description.Trim(),
            string.IsNullOrWhiteSpace(request.PreviewClass)
                ? "preview-blue"
                : request.PreviewClass.Trim()
        );
    }

    private async Task<List<Painting>> ReadAllAsync()
    {
        if (!File.Exists(_filePath))
        {
            return [];
        }

        await using var stream = File.OpenRead(_filePath);
        var paintings = await JsonSerializer.DeserializeAsync<List<Painting>>(stream, JsonOptions);

        return paintings ?? [];
    }

    private async Task WriteAllAsync(List<Painting> paintings)
    {
        await using var stream = File.Create(_filePath);
        await JsonSerializer.SerializeAsync(stream, paintings, JsonOptions);
    }
}
