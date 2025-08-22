using API.Models.Entities;

namespace API.Repositories;

public interface IBookingRepository
{
    Task<IReadOnlyList<Booking>> GetAllAsync(CancellationToken ct = default);
    Task<Booking?> GetBookingByIdAsync(Guid id, CancellationToken ct = default);
    Task<Booking> CreateAsync(Booking entity, CancellationToken ct = default);
    Task DeleteByIdAsync(Guid id, CancellationToken ct = default);
}