using System.ComponentModel.DataAnnotations;

namespace API.Models.Entities;

public class Role : Entity<int>
{
    [MaxLength(50)] public required string Name { get; set; }

    public List<User> Users { get; } = new List<User>();
}

public static class RoleNames
{
    public const string Admin = "Admin";
    public const string Receptionist = "Receptionist";
    public const string Cleaner = "Cleaner";
    public const string Customer = "Customer";

    public static readonly string[] All = [Admin, Receptionist, Cleaner, Customer];
}