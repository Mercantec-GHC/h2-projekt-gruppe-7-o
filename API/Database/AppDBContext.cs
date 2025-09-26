using API.Features.Chat;
using API.Models.Entities;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;

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
    public DbSet<Role> Roles { get; set; }
    public DbSet<Hotel> Hotels { get; set; }
    public DbSet<Ticket> Tickets { get; set; }
    public DbSet<TicketStatus> TicketStatuses { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {

        // User -> Role (many Users to one Role)
        modelBuilder.Entity<User>()
            .HasOne(u => u.Role)
            .WithMany(r => r.Users)
            .HasForeignKey(u => u.RoleId)
            .IsRequired()
            .OnDelete(DeleteBehavior.Restrict); // prevent deleting a role that still has users
        modelBuilder.Entity<User>()
            .Property(u => u.HashedPassword)
            .IsRequired(false); // AD users don't have a password

        modelBuilder.Entity<User>()
            .Property(u => u.IsADUser)
            .HasDefaultValue(false);


        // If you prefer to ensure Role.Name is unique via fluent instead of attribute:
        modelBuilder.Entity<Role>()
            .HasIndex(r => r.Name)
            .IsUnique();

        // Booking -> BookingLines (one-to-many)
        modelBuilder.Entity<Booking>()
            .HasMany(b => b.BookingLines)
            .WithOne(bl => bl.Booking)
            .HasForeignKey(bl => bl.BookingId)
            .IsRequired();

        // Booking -> Rooms (many-to-many)
        modelBuilder.Entity<Booking>()
            .HasMany(b => b.Rooms)
            .WithMany(r => r.Bookings)
            .UsingEntity(j => j.ToTable("BookingRooms"));

        // Booking -> User (many-to-one)
        modelBuilder.Entity<Booking>()
            .HasOne(b => b.User)
            .WithMany(u => u.Bookings)
            .HasForeignKey(b => b.UserId);


        modelBuilder.Entity<Ticket>()
            .HasOne(t => t.Status)
            .WithMany(s => s.Tickets)
            .HasForeignKey(t => t.StatusId);

        // Seeding af statusser
        modelBuilder.Entity<TicketStatus>().HasData(
            new TicketStatus { Id = 1, Name = "Open", CreatedAt = DateTimeOffset.Now, UpdatedAt = DateTimeOffset.Now },
            new TicketStatus { Id = 2, Name = "In Progress", CreatedAt = DateTimeOffset.Now, UpdatedAt = DateTimeOffset.Now },
            new TicketStatus { Id = 3, Name = "Closed", CreatedAt = DateTimeOffset.Now, UpdatedAt = DateTimeOffset.Now }
        );


        base.OnModelCreating(modelBuilder);

    }

    public override int SaveChanges()
    {
        ApplyTimestamps();
        return base.SaveChanges();
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        ApplyTimestamps();
        return base.SaveChangesAsync(cancellationToken);
    }

    private void ApplyTimestamps()
    {
        var now = DateTimeOffset.UtcNow;

        foreach (var entry in ChangeTracker.Entries<IAuditable>())
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.CreatedAt = now;
                entry.Entity.UpdatedAt = now;
            }
            else if (entry.State == EntityState.Modified)
            {
                // Prevent accidental changes to CreatedAt
                entry.Property(nameof(IAuditable.CreatedAt)).IsModified = false;
                entry.Entity.UpdatedAt = now;
            }
        }
    }
}