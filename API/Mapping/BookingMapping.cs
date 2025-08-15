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

    public static Booking ToBooking(this BookingCreateDto bookingCreateDto, decimal totalPrice)
    {
        //TODO: The total price should be calculated on the fly (not coming from the cleint) and then stored in the database.
        // What is the best way to do this? Do we pass it in as a dependency to our mapper? Do we even use a mapper for this?
        return new Booking
        {
            CheckIn = bookingCreateDto.CheckIn,
            CheckOut = bookingCreateDto.CheckOut,
            Adults = bookingCreateDto.Adults,
            Children = bookingCreateDto.Children,
            TotalPrice = totalPrice,
            Status = BookingStatus.Pending
        };
    }
}