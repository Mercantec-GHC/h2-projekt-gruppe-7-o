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
        return await RoomWithHotel().ToListAsync(ct);
    }

    public async Task<Room?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        return await RoomWithHotel().FirstOrDefaultAsync(r => r.Id == id, ct);
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


  
    public async Task<IReadOnlyList<Room>> GetRoomsWithHousekeepingDetailsAsync(CancellationToken ct = default)
    {
        return await RoomWithHotel().ToListAsync(ct);
    }

    
    public async Task<IReadOnlyList<Room>> GetAssignedRoomsByHousekeeperAsync(Guid housekeeperId, CancellationToken ct = default)
    {
       return await RoomWithHotel()
        .Where(r => r.AssignedHousekeeperId == housekeeperId)
        .ToListAsync(ct);
    }

    public async Task<Room?> UpdateHousekeepingFieldsAsync(
      Guid roomId,
      int? newStatus = null,
      Guid? assignedHousekeeperId = null,
      string? maintenanceNote = null,
      bool? isPriority = null,
      CancellationToken ct = default)
    {
        var room = await _context.Rooms.FindAsync(new object?[] { roomId }, ct);
        if (room == null) return null;

        if (newStatus.HasValue)
        {
            room.HousekeepingStatus = newStatus.Value;
            room.LastStatusUpdateTime = DateTimeOffset.UtcNow;
        }

        // Her sætter vi assignedHousekeeperId til null hvis det er sendt
        room.AssignedHousekeeperId = assignedHousekeeperId;

        // Her sætter vi isPriority, også hvis det er false
        if (isPriority.HasValue)
            room.IsPriority = isPriority.Value;

        // Håndtering af MaintenanceNote
        if (maintenanceNote != null)
        {
            room.MaintenanceNote = maintenanceNote;
        }
        else if (room.MaintenanceNote != null && room.HousekeepingStatus != (int)HousekeepingStatus.OutOfOrder)
        {
            room.MaintenanceNote = null;
        }

        return room;
    }


    private IQueryable<Room> RoomWithHotel()
    {
        return _context.Rooms
            .Include(r => r.Hotel)
            .AsNoTracking();
    }


}
