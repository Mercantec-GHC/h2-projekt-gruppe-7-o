using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DomainModels
{
    public class Room
    {
        public int Id { get; set; }

        public string Name { get; set; }

        public string RoomNumber { get; set; }

        public string RoomType { get; set; } // "Single", "Double", "Suite"

        public decimal PricePerNight { get; set; }

        public bool IsAvailable { get; set; }

        public int Capacity { get; set; }

        public string Description { get; set; }

        // Navigation property – et rum kan være booket mange gange
        public ICollection<Booking> Bookings { get; set; }
    }
}
