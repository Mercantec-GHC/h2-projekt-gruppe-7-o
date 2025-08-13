namespace API.Models.Entities;

public interface IAuditable
{
    DateTimeOffset CreatedAt { get; set; }
    DateTimeOffset UpdatedAt { get; set; }
}

public abstract class Entity<TKey> : IAuditable
{
    //TODO: add soft delete
    public TKey Id { get; protected init; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}