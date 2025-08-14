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
    public required short Adults { get; init; }
    public required short Children { get; init; }
    public List<Guid>? RoomIds { get; init; }
}

public sealed class BookingUpdateDto
{
    public required DateTime CheckIn { get; init; }
    public required DateTime CheckOut { get; init; }
    public required short Adults { get; init; }
    public required short Children { get; init; }
    public List<Guid>? RoomIds { get; init; } // make nullable if partial updates
}