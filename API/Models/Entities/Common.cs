using System.ComponentModel.DataAnnotations;

namespace API.Models.Entities;

public class Common
{
    [Key] public Guid Id { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}