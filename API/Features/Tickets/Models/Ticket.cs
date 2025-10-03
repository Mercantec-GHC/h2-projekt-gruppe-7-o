using API.Models.Entities;
using System.ComponentModel.DataAnnotations;
using API.Features.Chat;
using NpgsqlTypes;

public class Ticket : Entity<int>
{
    [Required] [MaxLength(255)] public string Title { get; set; } = string.Empty;

    [Required] public string Description { get; set; } = string.Empty;

    // FK til status
    public int StatusId { get; set; }
    public TicketStatus Status { get; set; } = null!;

    // Hvis vi bruger Identity
    public Guid? AssignedToUserId { get; set; }

    public User? AssignedToUser { get; set; }

    // Track who created the ticket
    public Guid? CreatedByUserId { get; set; }

    public User? CreatedByUser { get; set; }

    public ICollection<TicketMessage> Messages { get; set; } = new List<TicketMessage>();
}


public enum TicketStatusEnum
{
    [PgName("open")] Open,
    [PgName("in progress")] InProgress,
    [PgName("waiting for customer")] WaitingForCustomer,
    [PgName("waiting for agent")] WaitingForAgent,
    [PgName("resolved")] Resolved,
    [PgName("closed")] Closed,
}
