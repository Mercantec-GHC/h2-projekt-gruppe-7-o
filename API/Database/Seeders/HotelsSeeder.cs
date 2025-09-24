using API.Models.Entities;
using Bogus;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Data.Seeders;

public class HotelsSeeder(AppDBContext context)
{
    private readonly AppDBContext _context = context;

    public async Task<List<Hotel>> SeedAsync()
    {
        if (await _context.Hotels.AnyAsync())
            return await _context.Hotels.Include(h => h.Rooms).ToListAsync();

        var cities = new List<string> { "København", "Aarhus", "Odense", "Aalborg" };
        var faker = new Faker("en");
        var hotels = new List<Hotel>();
        int globalRoomCounter = 0;

        foreach (var city in cities)
        {
            var hotel = new Hotel
            {
                Id = Guid.NewGuid(),
                Name = $"KabdiKhan {city}",
                Email = $"{city.ToLower()}@KabdiKhan.com",
                PhoneNumber = "75121212",
                City = city,
                StreetName = $"{city}gade",
                StreetNumber = faker.Address.BuildingNumber(),
                ZipCode = faker.Address.ZipCode(),
                Country = "Danmark",
                // Tilføj et generelt hotelbillede
                ImageUrl = GetHotelImageUrl(city)
            };

            var rooms = new List<Room>();

            rooms.AddRange(CreateRooms(hotel.Id, RoomType.Standard, 2, 50, ref globalRoomCounter));
            rooms.AddRange(CreateRooms(hotel.Id, RoomType.Deluxe, 2, 40, ref globalRoomCounter));
            rooms.AddRange(CreateRooms(hotel.Id, RoomType.Family, 6, 20, ref globalRoomCounter));
            rooms.AddRange(CreateRooms(hotel.Id, RoomType.Suite, 4, 10, ref globalRoomCounter));

            hotel.Rooms = rooms;

            _context.Hotels.Add(hotel);
            await _context.SaveChangesAsync();

            hotels.Add(hotel);
        }

        return hotels;
    }

    private List<Room> CreateRooms(Guid hotelId, RoomType roomType, short capacity, int count, ref int globalRoomCounter)
    {
        var faker = new Faker("en");
        var rooms = new List<Room>();
        var price = GetRoomPrice(faker, roomType);
        var description = GetRoomDescription(faker, roomType);
        var imageUrl = GetRoomImageUrl(roomType);

        for (int i = 0; i < count; i++)
        {
            rooms.Add(new Room
            {
                Id = Guid.NewGuid(),
                HotelId = hotelId,
                Number = (++globalRoomCounter).ToString("D3"),
                Capacity = capacity,
                PricePerNight = price,
                Type = roomType,
                Floor = faker.Random.Short(1, 10),
                Description = description,
                ImageUrl = imageUrl,
                IsActive = true
            });
        }
        return rooms;
    }

    private static string GetHotelImageUrl(string city)
    {
        return city switch
        {
            "København" => "https://source.unsplash.com/1600x900/?copenhagen-hotel",
            "Aarhus" => "https://source.unsplash.com/1600x900/?aarhus-hotel",
            "Odense" => "https://source.unsplash.com/1600x900/?odense-hotel",
            "Aalborg" => "https://source.unsplash.com/1600x900/?aalborg-hotel",
            _ => "https://source.unsplash.com/1600x900/?hotel"
        };
    }

    private static string GetRoomImageUrl(RoomType roomType)
    {
        return roomType switch
        {
            RoomType.Standard => "https://source.unsplash.com/800x600/?hotel-standard-room",
            RoomType.Deluxe => "https://source.unsplash.com/800x600/?hotel-deluxe-room",
            RoomType.Family => "https://source.unsplash.com/800x600/?hotel-family-room",
            RoomType.Suite => "https://source.unsplash.com/800x600/?hotel-suite",
            _ => "https://source.unsplash.com/800x600/?hotel-room"
        };
    }

    private static string GetRoomDescription(Faker faker, RoomType roomType)
    {
        var baseDescription = "Dette hyggelige værelse er designet for maksimal komfort og afslapning. Værelset inkluderer moderne møbler og gratis Wi-Fi.";
        switch (roomType)
        {
            case RoomType.Standard:
                return $"{baseDescription} Perfekt for den enkelt rejsende eller et par. Indeholder en stor queensize-seng og en-suite badeværelse.";
            case RoomType.Deluxe:
                return $"{baseDescription} Opgrader din oplevelse i dette rummelige værelse med plads til to. Nyd en ekstra stor dobbeltseng og en udsigt over byen.";
            case RoomType.Family:
                return $"{baseDescription} Ideelt for familier eller grupper. Dette værelse tilbyder god plads, to store dobbeltsenge og et spiseområde, der sikrer en behagelig ferie for alle.";
            case RoomType.Suite:
                return $"{baseDescription} Forkæl dig selv med vores luksuriøse suite. Nyd en separat soveværelsesafdeling, et elegant badeværelse med badekar, en privat stue med sofa, og en fantastisk udsigt over havnen.";
            default:
                return faker.Lorem.Sentence();
        }
    }

    private static decimal GetRoomPrice(Faker faker, RoomType roomType)
    {
        
        var basePrice = roomType switch
        {
            RoomType.Standard => 800,
            RoomType.Deluxe => 1200,
            RoomType.Family => 1800,
            RoomType.Suite => 3000,
            _ => 1000
        };

        return basePrice;
    }
}