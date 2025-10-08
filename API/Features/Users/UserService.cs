using API.Data;
using API.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace API.Features.Users
{
    public class UserService
    {
        private readonly AppDBContext _context;

        public UserService(AppDBContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Henter alle brugere med roller: Cleaner, HousekeepingManager, Admin
        /// </summary>
        /// <returns>Liste af users</returns>
        public async Task<List<User>> GetUsersByRolesAsync(params string[] roles)
        {
            return await _context.Users
                .Where(u => roles.Contains(u.Role.Name))
                .ToListAsync();
        }

        /// <summary>
        /// Hent alle brugere med rollerne Cleaner, HousekeepingManager eller Admin
        /// </summary>
        public async Task<List<User>> GetHousekeepingRelevantUsersAsync()
        {
            string[] roles = { "Cleaner", "HousekeepingManager", "Admin" };
            return await _context.Users
                .Where(u => roles.Contains(u.Role.Name))
                .ToListAsync();
        }
    }
}
