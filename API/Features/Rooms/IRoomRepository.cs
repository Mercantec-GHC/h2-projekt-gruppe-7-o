using API.Models.Entities;

namespace API.Repositories;

public interface IRoomRepository
{
    Task<IReadOnlyList<Room>> GetAllAsync(CancellationToken ct = default);
    Task<Room?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task AddAsync(Room room, CancellationToken ct = default);
    Task DeleteByIdAsync(Guid id, CancellationToken ct = default);
    Task SaveChangesAsync(CancellationToken ct = default);

    /// <summary>
    /// Henter alle værelser, ofte med Inclusions (f.eks. Housekeeper navn), til managers overblik.
    /// </summary>
    Task<IReadOnlyList<Room>> GetRoomsWithHousekeepingDetailsAsync(CancellationToken ct = default);

    /// <summary>
    /// Henter de værelser, der er tildelt en specifik assistent.
    /// </summary>
    Task<IReadOnlyList<Room>> GetAssignedRoomsByHousekeeperAsync(Guid housekeeperId, CancellationToken ct = default);

    /// <summary>
    /// Finder et værelse og opdaterer dets Housekeeping-relaterede felter.
    /// Returnerer den opdaterede Room-entitet.
    /// </summary>
    Task<Room?> UpdateHousekeepingFieldsAsync(
        Guid roomId,
        int? newStatus = null,
        Guid? assignedHousekeeperId = null,
        string? maintenanceNote = null,
        bool? isPriority = null,
        CancellationToken ct = default);


}
