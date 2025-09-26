using API.Models.Entities;
using System.ComponentModel.DataAnnotations;

namespace API.Features.Chat
{
    public class TicketStatus : Entity<int>
    {
        [Required]
        [MaxLength(50)]
        public string Name { get; set; } = string.Empty;

        // Fx: "Open", "In Progress", "Closed"
        public ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
    }

}
