using API.Models.Entities;
using Bogus;
using Microsoft.EntityFrameworkCore;

namespace API.Data.Seeders;

public class HotelsSeeder(AppDBContext context)
{
    private readonly AppDBContext _context = context;

    public async Task<List<Hotel>> SeedAsync()
    {
        if (await _context.Hotels.AnyAsync())
            return await _context.Hotels.Include(h => h.Rooms).ToListAsync();

        // Definer byer og antal værelser
        var cityRoomConfig = new Dictionary<string, int>
        {
            { "København", 110 },
            { "Aarhus", 75 },
            { "Odense", 80 }
        };

        var faker = new Faker("en");
        var hotels = new List<Hotel>();
        int roomCounter = 0;

        foreach (var kvp in cityRoomConfig)
        {
            var city = kvp.Key;
            var roomCount = kvp.Value;

            // Opret hotel
            var hotel = new Hotel
            {
                Id = Guid.NewGuid(),
                Name = $"{city} KaAbdi Khan",
                Email = $"{city.ToLower()}@KaAbdiKhan.com",
                PhoneNumber = faker.Phone.PhoneNumber(),
                City = city,
                StreetName = faker.Address.StreetName(),
                StreetNumber = faker.Address.BuildingNumber(),
                ZipCode = faker.Address.ZipCode(),
                Country = "Danmark"
            };

            // Opret værelser til dette hotel
            var roomFaker = new Faker<Room>("en")
                .RuleFor(r => r.Id, _ => Guid.NewGuid())
                .RuleFor(r => r.HotelId, _ => hotel.Id)
                .RuleFor(r => r.Number, _ => (++roomCounter).ToString("D3")) // globale unikke værelsesnumre
                .RuleFor(r => r.Capacity, f => f.Random.Short(1, 6))
                .RuleFor(r => r.PricePerNight, f => f.Random.Decimal(300, 2000))
                .RuleFor(r => r.Type, f => f.PickRandom<RoomType>())
                .RuleFor(r => r.Floor, f => f.Random.Short(1, 10))
                .RuleFor(r => r.Description, f => f.Lorem.Sentence())
                .RuleFor(r => r.IsActive, f => f.Random.Bool());

            hotel.Rooms = roomFaker.Generate(roomCount);

            hotels.Add(hotel);
        }

        _context.Hotels.AddRange(hotels);
        await _context.SaveChangesAsync();

        return hotels;
    }
}
