// API/Models/Entities/ChatSession.cs (OPDATERET)

using API.Models.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using API.Features.Chat;

public class Ticket : Entity<int>
{
    [Required]
    [MaxLength(255)]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Description { get; set; } = string.Empty;

    // FK til status
    public int StatusId { get; set; }
    public TicketStatus Status { get; set; } = null!;

    // Hvis vi bruger Identity
    public string? AssignedToUserId { get; set; }
}