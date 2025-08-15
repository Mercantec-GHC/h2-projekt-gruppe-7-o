using API.Models.Dtos;
using API.Models.Entities;

namespace API.Mapping;

public static class HotelMapping
{
    public static HotelResponseDto ToHotelDto(this Hotel hotel)
    {
        return new HotelResponseDto
        {
            Id = hotel.Id,
            Name = hotel.Name,
            StreetName = hotel.StreetName,
            StreetNumber = hotel.StreetNumber,
            City = hotel.City,
            ZipCode = hotel.ZipCode,
            Country = hotel.Country,
            Email = hotel.Email,
            PhoneNumber = hotel.PhoneNumber,
            CreatedAt = hotel.CreatedAt,
            UpdatedAt = hotel.UpdatedAt
        };
    }

    public static Hotel ToHotel(this HotelCreateDto hotelCreateDto)
    {
        return new Hotel
        {
            Name = hotelCreateDto.Name,
            StreetName = hotelCreateDto.StreetName,
            StreetNumber = hotelCreateDto.StreetNumber,
            City = hotelCreateDto.City,
            ZipCode = hotelCreateDto.ZipCode,
            Country = hotelCreateDto.Country,
            Email = hotelCreateDto.Email,
            PhoneNumber = hotelCreateDto.PhoneNumber,
        };
    }
}