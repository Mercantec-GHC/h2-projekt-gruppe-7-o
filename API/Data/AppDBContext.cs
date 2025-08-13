using API.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

/// <summary>
/// Represents the Entity Framework database context for the application.
/// Provides access to Users, Rooms, and Bookings entities.
/// </summary>
public class AppDBContext : DbContext
{
    public AppDBContext(DbContextOptions<AppDBContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Room> Rooms { get; set; }
    public DbSet<Booking> Bookings { get; set; }
    public DbSet<Role> Roles { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // 1:n: User -> Role
        modelBuilder.Entity<User>()
            .HasOne(u => u.Role)
            .WithMany(r => r.Users)
            .HasForeignKey(u => u.RoleId)
            .OnDelete(DeleteBehavior.Restrict);
        // undgå at slette rolle hvis der findes users

        // (Nice-to-have) Unikt navn på roller
        modelBuilder.Entity<Role>()
            .HasIndex(r => r.Name)
            .IsUnique();


        var now = DateTime.UtcNow;

        // Seed roller med faste GUID’er
        modelBuilder.Entity<Role>().HasData(
            new Role { Id = Guid.Parse("11111111-1111-1111-1111-111111111111"), Name = "Kunde" },
            new Role { Id = Guid.Parse("22222222-2222-2222-2222-222222222222"), Name = "Admin" },
            new Role { Id = Guid.Parse("33333333-3333-3333-3333-333333333333"), Name = "Receptionist" },
            new Role { Id = Guid.Parse("44444444-4444-4444-4444-444444444444"), Name = "Rengøring" }
        );

    }

    // protected override void OnModelCreating(ModelBuilder modelBuilder)
    // {
    //     // Registers the PostgreSQL enum type for migrations and model metadata
    //     modelBuilder.HasPostgresEnum<RoomType>(name: "room_type");
    //     base.OnModelCreating(modelBuilder);
    // }
}