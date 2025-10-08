using API.Models.Entities;
using System.ComponentModel.DataAnnotations;

namespace API.Features.Chat
{
    public class TicketStatus : Entity<int>
    {
        [Required]
        [MaxLength(50)]
        //TODO: instead of a string here, we should use an enum.. We have no way of knowing what the possible values are, unless we look at the DB or AppDBContext.
        public string Name { get; set; } = string.Empty;

        // Fx: "Open", "In Progress", "Closed"
        public ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
    }
}