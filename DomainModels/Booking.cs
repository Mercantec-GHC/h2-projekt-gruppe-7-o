using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DomainModels
{
    public class Booking
    {
        public int Id { get; set; }

        public DateTime CheckInDate { get; set; }

        public DateTime CheckOutDate { get; set; }
        public int NumberOfGuests { get; set; }

        public string Status { get; set; } // "Pending", "Confirmed", "Cancelled"

        public decimal TotalPrice { get; set; }

        public string Notes { get; set; }

        // Foreign keys
        public int UserId { get; set; }
        public int RoomId { get; set; }

        // Navigation properties
        public User User { get; set; }
        public Room Room { get; set; }
    }
}
