using API.Models.Entities;

namespace API.Repositories;

public interface IBookingRepository
{
    Task<IReadOnlyList<Booking>> GetAllAsync(CancellationToken ct = default);
    Task<Booking?> GetBookingByIdAsync(Guid id, CancellationToken ct = default);
    Task<Booking> CreateAsync(Booking entity, CancellationToken ct = default);
    Task DeleteByIdAsync(Guid id, CancellationToken ct = default);

    Task<List<Room>> GetRoomsByIdsAsync(List<Guid> roomIds, CancellationToken ct = default);
    Task<List<Booking>> GetOverlappingBookingsAsync(List<Guid> roomIds, DateTime checkIn, DateTime checkOut, CancellationToken ct = default);
    Task<Room?> GetAvailableRoomByTypeAsync(RoomType roomType, DateTime checkIn, DateTime checkOut, Guid? hotelId);
}