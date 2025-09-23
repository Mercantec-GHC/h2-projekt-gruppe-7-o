using API.Models.Dtos;
using API.Models.Entities;

namespace API.Mapping;

public static class BookingMapping
{
    public static BookingResponseDto ToBookingDto(this Booking Booking)
    {
        return new BookingResponseDto
        {
            Id = Booking.Id,
            CheckIn = Booking.CheckIn,
            CheckOut = Booking.CheckOut,
            Adults = Booking.Adults,
            Children = Booking.Children,
            TotalPrice = Booking.TotalPrice, // Use the stored TotalPrice
            Status = Booking.Status,
            CreatedAt = Booking.CreatedAt,
            UpdatedAt = Booking.UpdatedAt,
            User = Booking.User?.ToUserDto(),
            // You should get rooms from the booking lines, not the Rooms collection
            Rooms = Booking.BookingLines?
                .Where(bl => bl.Type == BookingLineType.Room && bl.Room != null)
                .Select(bl => bl.Room.ToRoomDto())
                .ToList() ?? new List<RoomResponseDto>()
        };
    }


}