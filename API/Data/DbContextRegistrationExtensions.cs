using API.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

// Infrastructure/DbContextRegistrationExtensions.cs

public static class DbContextRegistrationExtensions
{
    public static IServiceCollection AddAppDbContext(
        this IServiceCollection services,
        string connectionString)
    {
        services.AddDbContext<AppDBContext>(options =>
            options.UseNpgsql(connectionString, o =>
            {
                o.MapEnum<RoomType>("room_type");
                o.MapEnum<BookingStatus>("booking_status");
                // Add other enum mappings here
            }));

        return services;
    }
}