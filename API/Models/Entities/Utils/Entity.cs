using System.ComponentModel.DataAnnotations;

namespace API.Models.Entities;

public abstract class Entity<TKey>
{
    public TKey Id { get; protected init; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}