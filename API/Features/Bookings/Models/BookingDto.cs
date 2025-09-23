using API.Models.Entities;

namespace API.Models.Dtos;

public class BookingResponseDto : Entity<Guid>
{
    public required DateTime CheckIn { get; init; }
    public required DateTime CheckOut { get; init; }
    public required short Adults { get; init; }
    public required short Children { get; init; }

    public required decimal TotalPrice { get; init; }

    //TODO: we need to return the name of the status here instead of the enum value (0,1,2 etc.)
    public required BookingStatus Status { get; set; }

    public UserReponseDto User { get; init; }
    public ICollection<RoomResponseDto> Rooms { get; init; } = new List<RoomResponseDto>();
}

public class BookingWithRoomsDto : BookingResponseDto
{
    public List<RoomResponseDto> Rooms { get; set; } = new List<RoomResponseDto>();
}

public sealed class BookingCreateDto
{
    public required DateTime CheckIn { get; init; }
    public required DateTime CheckOut { get; init; }
    public Guid? HotelId { get; set; } // Valgfrit, hvis bookingen kun gælder for ét hotel
    public List<RoomBookingDto> RoomBookings { get; set; } // En liste med hvert værelse og dets tilvalg
}

public sealed class BookingUpdateDto
{
    public required DateTime CheckIn { get; set; }
    public required DateTime CheckOut { get; set; }
    public required short Adults { get; set; }
    public required short Children { get; set; }
    public List<Guid>? RoomIds { get; init; } // make nullable if partial updates
    public List<BookingLineCreateDto>? Addons { get; init; } // Ekstra services/fees/discounts
}

public class RoomBookingDto
{
    public RoomType RoomType { get; set; }
    public required short Adults { get; init; }
    public required short Children { get; init; }

    public List<AddonDto> Addons { get; set; }
}


public class AddonDto
{
    public BookingLineType Type { get; set; }
    public string? Description { get; set; }
    public decimal Amount { get; set; }
}

public sealed class BookingLineCreateDto
{
    public BookingLineType Type { get; init; }
    public string? Description { get; init; }
    public decimal Amount { get; init; }
}