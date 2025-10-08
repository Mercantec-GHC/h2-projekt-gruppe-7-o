using API.Models.Entities;
using Bogus;
using Microsoft.EntityFrameworkCore;
using System; // Tilføj denne for Guid og DateTimeOffset
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

            // Antallet af værelser er en god blanding til at starte med
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

        // Bestem start HousekeepingStatus
        // Sæt de fleste til CleanReady, men et par stykker til DirtyCheckout for at teste prioritering
        HousekeepingStatus initialStatus;
        if (roomType == RoomType.Standard && globalRoomCounter < 5) // Eksempel: De første 5 Standard værelser er klar
        {
            initialStatus = HousekeepingStatus.CleanReady;
        }
        else if (globalRoomCounter % 10 == 0) // Hvert 10. værelse er DirtyCheckout
        {
            initialStatus = HousekeepingStatus.DirtyCheckout;
        }
        else
        {
            initialStatus = HousekeepingStatus.CleanReady; // Standard status
        }

        // Bestem IsPriority for et par Suiter
        bool isPriority = roomType == RoomType.Suite && faker.Random.Bool(0.3f); // 30% chance for VIP suite

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
                IsActive = true,
                LastStatusUpdateTime = DateTimeOffset.UtcNow,

                // --- NYE HOUSEKEEPING FELTER ---
                HousekeepingStatus = (int)initialStatus, // Konverter til int
                AssignedHousekeeperId = null, // Intet tildelt i starten
                LastServiceRequested = null, // Ingen service anmodet
                MaintenanceNote = null, // Ingen fejl rapporteret
                IsPriority = isPriority
                // -----------------------------
            });
        }
        return rooms;
    }

    private static string GetHotelImageUrl(string city)
    {
        // ... (Uændret) ...
        return city switch
        {
            "København" => "https://images.pexels.com/photos/189296/pexels-photo-189296.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=1600&h=900&fit=crop",
            "Aarhus" => "https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=1600&h=900&fit=crop",
            "Odense" => "https://images.pexels.com/photos/2034335/pexels-photo-2034335.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=1600&h=900&fit=crop",
            "Aalborg" => "https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=1600&h=900&fit=crop",
            _ => "https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=1600&h=900&fit=crop"
        };
    }

    private static string GetRoomImageUrl(RoomType roomType)
    {
        // ... (Uændret) ...
        return roomType switch
        {
            RoomType.Standard => "https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=800&h=600&fit=crop",
            RoomType.Deluxe => "https://images.pexels.com/photos/271643/pexels-photo-271643.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=800&h=600&fit=crop",
            RoomType.Family => "https://images.pexels.com/photos/6489083/pexels-photo-6489083.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=800&h=600&fit=crop",
            RoomType.Suite => "https://images.pexels.com/photos/262047/pexels-photo-262047.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=800&h=600&fit=crop",
            _ => "https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=800&h=600&fit=crop"
        };
    }


    private static string GetRoomDescription(Faker faker, RoomType roomType)
    {
        // ... (Uændret) ...
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
        // ... (Uændret) ...
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