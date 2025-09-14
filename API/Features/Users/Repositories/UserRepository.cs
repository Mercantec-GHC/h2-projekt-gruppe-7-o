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
        var user = await _context.Users
            .Include(u => u.Role)                  // load user role
            .Include(u => u.Bookings)              // load bookings
                .ThenInclude(b => b.Rooms)        // load rooms for each booking
            .FirstOrDefaultAsync(u => u.Id == id); // FindAsync virker ikke med Include
        return user;
    }


    public async Task UpdateUserAsync(Guid id, UserUpdateDto userUpdateDto)
    {
        var user = await _context.Users.FindAsync(id);

        if (user == null)
            throw new KeyNotFoundException($"User with id {id} not found");

        // Mapper felter fra DTO til entity
        user.FirstName = userUpdateDto.FirstName;
        user.LastName = userUpdateDto.LastName;
        user.Phone = userUpdateDto.Phone;
        //vi kan tilføje evt. andre felter

        // EF Core track’er allerede entity’en, så vi skal kun gemme
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
        // Find brugeren først
        var user = await _context.Users.FindAsync(id);

        if (user == null)
            return null; // Return null, hvis brugeren ikke findes

        // Fjern brugeren
        _context.Users.Remove(user);

        try
        {
            await _context.SaveChangesAsync(); // Gem ændringer
        }
        catch (DbUpdateConcurrencyException)
        {
            // Hvis entity blev slettet af en anden, returner null
            return null;
        }

        return user; // Returner den slettede bruger
    }



    public async Task<User?> FindUserByEmail(string email)
    {
        return await _context.Users.Include(u => u.Role).SingleOrDefaultAsync(u => u.Email == email);
    }
}