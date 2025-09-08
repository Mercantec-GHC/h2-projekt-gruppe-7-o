using API.Models.Dtos;
using API.Models.Entities;

namespace API.Mapping;

public static class BookingMapping
{
    public static BookingResponseDto ToBookingDto(this Booking Booking)
    {
        // Beregn antal dage
        var days = (Booking.CheckOut - Booking.CheckIn).Days;
        if (days <= 0) days = 1;

        // Beregn totalpris
        decimal totalPrice = 0;

        if (Booking.BookingLines != null && Booking.BookingLines.Any())
        {
            totalPrice = Booking.BookingLines
                .Where(bl => bl.Status != BookingLineStatus.Cancelled)
                .Sum(bl => bl.Amount);
        }
        else if (Booking.Rooms != null && Booking.Rooms.Any())
        {
            totalPrice = Booking.Rooms.Sum(r => r.PricePerNight * days);
        }


        return new BookingResponseDto
        {
            Id = Booking.Id,
            CheckIn = Booking.CheckIn,
            CheckOut = Booking.CheckOut,
            Adults = Booking.Adults,
            Children = Booking.Children,
            
            TotalPrice = totalPrice,
            Status = Booking.Status,
            CreatedAt = Booking.CreatedAt,
            UpdatedAt = Booking.UpdatedAt,
            User = Booking.User?.ToUserDto(),
            Rooms = Booking.Rooms?.Select(r => r.ToRoomDto()).ToList() ?? new List<RoomResponseDto>()

        };
    }

    public static Booking ToBooking(this BookingCreateDto bookingCreateDto, Guid userId, List<Room> rooms)
    {
        return new Booking
        {
            CheckIn = bookingCreateDto.CheckIn,
            CheckOut = bookingCreateDto.CheckOut,
            Adults = bookingCreateDto.Adults,
            Children = bookingCreateDto.Children,
            UserId = userId,
            Rooms = rooms,
            Status = BookingStatus.Pending
        };
    }
}