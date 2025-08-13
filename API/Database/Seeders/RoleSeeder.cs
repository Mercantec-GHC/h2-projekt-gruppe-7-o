using API.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace API.Data.Seeders;

public class RoleSeeder
{
    static public void Seed(DbContext context)
    {
        foreach (var roleName in RoleNames.All)
        {
            var roleExists = context.Set<Role>().Any(r => r.Name == roleName);
            if (!roleExists)
            {
                context.Set<Role>().Add(new Role
                {
                    Name = roleName,
                    //TODO: Is this redundant?
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                });
            }
        }

        context.SaveChanges();
    }
}