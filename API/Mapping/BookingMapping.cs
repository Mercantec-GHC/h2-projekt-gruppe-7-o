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
            TotalPrice = Booking.CalculateTotalPrice(),
            Status = Booking.Status,
            CreatedAt = Booking.CreatedAt,
            UpdatedAt = Booking.UpdatedAt
        };
    }

    public static Booking ToBooking(this BookingCreateDto bookingCreateDto)
    {
        return new Booking
        {
            CheckIn = bookingCreateDto.CheckIn,
            CheckOut = bookingCreateDto.CheckOut,
            Adults = bookingCreateDto.Adults,
            Children = bookingCreateDto.Children,
            Status = BookingStatus.Pending
        };
    }
}