using API.Models.Dtos;
using API.Models.Entities;

namespace API.Features.Chat;

public class TicketDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public User? AssignedToUser { get; set; }
    public User? CreatedByUser { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class AllTicketsResponseDto
{
    public List<TicketDto> Tickets { get; set; }
    public int TotalCount;
    public int Page;
    public int PageSize;
    public int TotalPages;
}

public class CreateTicketDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string StatusName { get; set; } = "Open"; // default
    public Guid? AssignedToUserId { get; set; }
}

public class UpdateTicketStatusDto
{
    public string StatusName { get; set; } = string.Empty;
}

public class AssignTicketDto
{
    public Guid? AssignedToUserId { get; set; }
}