using API.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public class AppDBContext : DbContext
{
    public AppDBContext(DbContextOptions<AppDBContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Room> Rooms { get; set; }
    public DbSet<Booking> Bookings { get; set; }

    // protected override void OnModelCreating(ModelBuilder modelBuilder)
    // {
    //     // Registers the PostgreSQL enum type for migrations and model metadata
    //     modelBuilder.HasPostgresEnum<RoomType>(name: "room_type");
    //     base.OnModelCreating(modelBuilder);
    // }
}