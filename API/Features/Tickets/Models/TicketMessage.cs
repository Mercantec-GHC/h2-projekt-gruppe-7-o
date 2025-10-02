using API.Models.Entities;
using System.ComponentModel.DataAnnotations;

namespace API.Features.Chat
{
    public class TicketMessage : Entity<int>
    {
        [Required] public int TicketId { get; set; }
        public Ticket Ticket { get; set; } = null!;

        [Required] public Guid UserId { get; set; }

        public User User { get; set; } = null!;


        [Required] public string Content { get; set; } = string.Empty;
        public bool IsInternal { get; set; } = false;
    }
}
