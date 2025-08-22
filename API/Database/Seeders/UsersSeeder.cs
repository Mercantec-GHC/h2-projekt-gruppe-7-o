using API.Models.Entities;
using API.Repositories;
using API.Services.Password;
using Bogus;
using Microsoft.EntityFrameworkCore;

namespace API.Data.Seeders;

public class UsersSeeder(AppDBContext context, IUserRepository userRepository, IPasswordHashingService passwordHasher)
{
    private readonly AppDBContext _context = context;
    private readonly IUserRepository _userRepository = userRepository;
    private readonly IPasswordHashingService _passwordHasher = passwordHasher;

    public async Task<List<User>> SeedAsync(int count = 20)
    {
        // Load existing role IDs so FK won’t break
        var roleIds = await _context.Roles.Select(r => r.Id).ToListAsync();
        if (roleIds.Count == 0)
        {
            throw new InvalidOperationException("No roles found. Seed roles before seeding users.");
        }

        var usedEmails = new HashSet<string>();

        var userFaker = new Faker<User>().RuleFor(c => c.Id, _ => Guid.NewGuid())
            .RuleFor(c => c.FirstName, f => f.Name.FirstName())
            .RuleFor(c => c.LastName, f => f.Name.LastName())
            .RuleFor(c => c.Email, f =>
            {
                string email;
                do
                {
                    email = f.Internet.Email().ToLower();
                } while (usedEmails.Contains(email));

                usedEmails.Add(email);
                return email;
            })
            .RuleFor(c => c.HashedPassword, _ => _passwordHasher.Hash("12345678"))
            .RuleFor(c => c.RoleId, f => f.Random.Int(1, 4));

        var users = userFaker.Generate(count);

        _context.Users.AddRange(users);
        await _context.SaveChangesAsync();
        return users;
    }
}