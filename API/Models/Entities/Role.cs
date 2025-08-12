using System.ComponentModel.DataAnnotations;

namespace API.Models.Entities;

public class Role : Entity<int>
{
    [MaxLength(50)] public string Name { get; set; } = "Customer";

    public List<User> Users { get; set; } = new();
}

public static class RoleNames
{
    public const string Admin = "Admin";
    public const string Receptionist = "Receptionist";
    public const string Cleaner = "Cleaner";
    public const string Customer = "Customer";

    public static readonly string[] All = [Admin, Receptionist, Cleaner, Customer];
}