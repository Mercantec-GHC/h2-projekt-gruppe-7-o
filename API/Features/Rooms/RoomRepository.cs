using API.Data;
using API.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace API.Repositories;

public class RoomRepository : IRoomRepository
{
    private readonly AppDBContext _context;

    public RoomRepository(AppDBContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<Room>> GetAllAsync(CancellationToken ct = default)
    {
        return await _context.Rooms.AsNoTracking().ToListAsync(ct);
    }

    public async Task<Room?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        return await _context.Rooms.FindAsync(new object?[] { id }, ct);
    }

    public async Task AddAsync(Room room, CancellationToken ct = default)
    {
        await _context.Rooms.AddAsync(room, ct);
    }

    public async Task DeleteByIdAsync(Guid id, CancellationToken ct = default)
    {
        var room = await _context.Rooms.FindAsync(new object?[] { id }, ct);
        if (room != null)
            _context.Rooms.Remove(room);
    }

    public async Task SaveChangesAsync(CancellationToken ct = default)
    {
        await _context.SaveChangesAsync(ct);
    }
}
