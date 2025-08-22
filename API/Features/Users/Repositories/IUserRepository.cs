using API.Models.Dtos;
using API.Models.Entities;

namespace API.Repositories;

public interface IUserRepository
{
    public Task<IReadOnlyList<User>> GetAllAsync(CancellationToken ct = default);
    public Task<User?> GetByIdAsync(Guid id);
    public Task AddAsync(User user);

    public Task UpdateUserAsync(Guid id, UserUpdateDto userUpdateDto);

    public Task<User?> DeleteByIdAsync(Guid id);
    public Task SoftDeleteByIdAsync(Guid id);

    public Task<User?> FindUserByEmail(string email);
}