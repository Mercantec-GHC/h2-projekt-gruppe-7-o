using API.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace API.Features.Bookings.Models
{
    // Enhed for prissætning af tilvalg
    // Denne entitet har en sammensat primærnøgle for unikhed.
    [PrimaryKey(nameof(RoomType), nameof(AddonType))]
    public class AddonPrice
    {
        public required RoomType RoomType { get; set; }
        public required BookingLineType AddonType { get; set; }
        public required decimal Price { get; set; }
        public required bool IsPerPerson { get; set; }
    }
}
