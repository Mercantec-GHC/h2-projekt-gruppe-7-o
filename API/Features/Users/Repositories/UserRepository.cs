using API.Data;
using API.Models.Dtos;
using API.Models.Entities;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace API.Repositories;

internal sealed class UserRepository(AppDBContext context) : IUserRepository
{
    private readonly AppDBContext _context = context;

    public async Task<IReadOnlyList<User>> GetAllAsync(CancellationToken ct = default)
    {
        var users = await _context.Users
            .AsNoTracking()
            .Include(u => u.Role)
            .Include(u => u.Bookings)
            .ToListAsync(ct);

        return users;
    }

    public async Task<User?> GetByIdAsync(Guid id)
    {
        var user = await _context.Users.FindAsync(id);
        return user;
    }


    public async Task UpdateUserAsync(Guid id, UserUpdateDto userUpdateDto)
    {
        _context.Entry(userUpdateDto).State = EntityState.Modified;

        await _context.SaveChangesAsync();
    }

    public async Task AddAsync(User user)
    {
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
    }


    public Task SoftDeleteByIdAsync(Guid id)
    {
        // TODO: implement
        throw new NotImplementedException();
    }

    public async Task<User?> DeleteByIdAsync(Guid id)
    {
        User? user = await _context.Users.FindAsync(id);

        if (user == null) return null;

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();
        return user;
    }

    public async Task<User?> FindUserByEmail(string email)
    {
        return await _context.Users.Include(u => u.Role).SingleOrDefaultAsync(u => u.Email == email);
    }
}