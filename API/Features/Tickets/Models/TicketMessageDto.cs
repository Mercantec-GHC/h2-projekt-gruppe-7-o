using API.Models.Dtos;
using API.Models.Entities;

namespace API.Features.Chat;

public class TicketMessageResponseDto
{
    public int Id { get; set; }
    public int TicketId { get; set; }

    // TODO: I can't get the ToUserDto() mapping method to work here, even though we have a user...
    public User User { get; set; }
    public string Content { get; set; } = string.Empty;
    public bool IsInternal { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class AllTicketMessagesResponseDto
{
    public List<TicketMessageResponseDto> Messages { get; set; }
    public int TotalCount;
    public int Page;
    public int PageSize;
    public int TotalPages;
}

public class CreateTicketMessageDto
{
    public string Content { get; set; } = string.Empty;
    public bool IsInternal { get; set; }
}