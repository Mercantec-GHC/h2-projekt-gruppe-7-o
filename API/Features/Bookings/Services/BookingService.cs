using API.Features.Mail.Services;
using API.Mapping;
using API.Models.Dtos;
using API.Models.Entities;
using API.Repositories;

namespace API.Features.Bookings.Services;

public class BookingService
{
    private readonly IBookingRepository _repository;
    private readonly ILogger<BookingService> _logger;
    private readonly MailService _mailService;

    public BookingService(IBookingRepository repository, ILogger<BookingService> logger, MailService mailService)
    {
        _repository = repository;
        _logger = logger;
        _mailService = mailService;
    }

    public async Task<BookingResponseDto> CreateBookingAsync(BookingCreateDto dto, Guid userId, string userEmail, string userName)
    {
        if (dto.CheckOut <= dto.CheckIn)
            throw new InvalidOperationException("Check-out must be after check-in.");

        // Init totals and lists before the loop
        short totalAdults = 0;
        short totalChildren = 0;
        decimal totalPrice = 0;
        var allRoomNumbers = new List<string>();

        // Create the single Booking object here, BEFORE the loop 
        var booking = new Booking
        {
            Id = Guid.NewGuid(),
            CheckIn = dto.CheckIn,
            CheckOut = dto.CheckOut,
            Status = BookingStatus.Pending,
            UserId = userId,
            Adults = 0,
            Children = 0,
            TotalPrice = 0,
            Rooms = new List<Room>(),
            BookingLines = new List<BookingLine>() 
        };

        // Calculate nights once for the whole booking duration
        var bookingNights = (dto.CheckOut.Date - dto.CheckIn.Date).Days;
        if (bookingNights <= 0) bookingNights = 1;

        var usedRoomIds = new List<Guid>();

        foreach (var roomBookingDto in dto.RoomBookings)
        {
            var room = await _repository.GetAvailableRoomByTypeAsync(
                roomBookingDto.RoomType,
                dto.CheckIn,
                dto.CheckOut,
                dto.HotelId,
                usedRoomIds
            );

            if (room == null)
                throw new InvalidOperationException($"No rooms of type '{roomBookingDto.RoomType}' are available for the period.");
            usedRoomIds.Add(room.Id);

            if (room.Capacity < (roomBookingDto.Adults + roomBookingDto.Children))
            {
                throw new InvalidOperationException($"Room type '{room.Type}' does not have capacity for {roomBookingDto.Adults + roomBookingDto.Children} guests.");
            }

            // Add room to the booking's Rooms collection
            booking.Rooms.Add(room);
            allRoomNumbers.Add(room.Number.ToString());

            totalAdults += roomBookingDto.Adults;
            totalChildren += roomBookingDto.Children;

            // Create booking line for the room
            var roomBookingLine = new BookingLine
            {
                Type = BookingLineType.Room,
                Description = $"Room {room.Number} - {room.Type}",
                RoomId = room.Id,
                Amount = room.PricePerNight * bookingNights, 
                Status = BookingLineStatus.Unpaid,
                CreatedBy = userId,
                UpdatedBy = userId,
                BookingId = booking.Id, 
                Booking = booking 
            };
            totalPrice += roomBookingLine.Amount;
            booking.BookingLines.Add(roomBookingLine);

            // Add booking lines for addons associated with this specific room
            if (roomBookingDto.Addons != null)
            {
                foreach (var addonDto in roomBookingDto.Addons)
                {
                    var addonBookingLine = new BookingLine
                    {
                        Type = addonDto.Type,
                        Description = addonDto.Description,
                        Amount = addonDto.Amount,
                        Status = BookingLineStatus.Unpaid,
                        BookingId = booking.Id,
                        CreatedBy = userId,
                        UpdatedBy = userId,
                        RoomId = room.Id,
                        Booking = booking 
                    };
                    totalPrice += addonBookingLine.Amount;
                    booking.BookingLines.Add(addonBookingLine);
                }
            }
        }

        
        booking.Adults = totalAdults;
        booking.Children = totalChildren;
        booking.TotalPrice = totalPrice;

        // 4. Save booking and send email
        await _repository.CreateAsync(booking);

        try
        {
            var roomNumbersString = string.Join(", ", allRoomNumbers);
            await _mailService.SendBookingConfirmationEmailAsync(
                userEmail,
                userName,
                roomNumbersString,
                "KabdiKhan", 
                booking.CheckIn,
                booking.CheckOut,
                (short)(booking.Adults + booking.Children), 
                bookingNights, 
                booking.TotalPrice,
                booking.Id
            );
            _logger.LogInformation("Booking confirmation email sent for booking {BookingId}", booking.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send confirmation email for booking {BookingId}", booking.Id);
        }

        return booking.ToBookingDto();
    }
}