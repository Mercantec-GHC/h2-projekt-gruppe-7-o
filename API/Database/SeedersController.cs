using API.Data.Seeders;
using API.Models.Entities;
using API.Services.Password;
using Bogus;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

// TODO: Test this ServiceFitler, does this actually work?
[Route("api/[controller]")]
[ApiController]
[ServiceFilter(typeof(DevelopmentOnlyFilter))]
public class SeedersController : ControllerBase
{
    private readonly AppDBContext _context;
    private readonly UsersSeeder _usersSeeder;
    private readonly IPasswordHashingService _passwordHashingService;

    public SeedersController(AppDBContext context, UsersSeeder usersSeeder,
        IPasswordHashingService passwordHashingService)
    {
        _context = context;
        _usersSeeder = usersSeeder;
        _passwordHashingService = passwordHashingService;
    }


    [HttpPost("users")]
    public async Task<IActionResult> SeedUsers([FromQuery] int count = 20)
    {
        try
        {
            await _usersSeeder.SeedAsync(count);
            return Ok($"{count} Users seeded!");
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("hotels")]
    public async Task<IActionResult> SeedHotels([FromQuery] int count = 20)
    {
        throw new NotImplementedException();
    }

    [HttpPost("init")]
    public async Task<IActionResult> InitializeDatabase()
    {
        var userFaker = new Faker<User>()
            .RuleFor(c => c.Id, _ => Guid.NewGuid())
            .RuleFor(c => c.FirstName, f => f.Name.FirstName())
            .RuleFor(c => c.LastName, f => f.Name.LastName())
            .RuleFor(c => c.Email, f => f.Internet.Email().ToLower())
            .RuleFor(c => c.HashedPassword, _ => _passwordHashingService.Hash("12345678"))
            .RuleFor(c => c.RoleId, f => f.Random.Int(1, 4));
        var users = userFaker.Generate(50);


        var hotelFaker = new Faker<Hotel>()
            .RuleFor(c => c.Id, _ => Guid.NewGuid())
            .RuleFor(c => c.Name, f => f.Name.FirstName())
            .RuleFor(c => c.Email, f => f.Name.LastName() + "@" + "kabdikhan.com")
            .RuleFor(c => c.PhoneNumber, f => f.Phone.PhoneNumber())
            .RuleFor(c => c.City, f => f.Address.City())
            .RuleFor(c => c.StreetName, f => f.Address.StreetName())
            .RuleFor(c => c.StreetNumber, f => f.Address.BuildingNumber())
            .RuleFor(c => c.ZipCode, f => f.Address.ZipCode())
            .RuleFor(c => c.Country, f => f.Address.Country());

        var hotels = hotelFaker.Generate(10);

        var roomCounter = 0;
        var roomFaker = new Faker<Room>()
            .RuleFor(c => c.Id, _ => Guid.NewGuid())
            .RuleFor(c => c.HotelId, f => f.PickRandom(hotels).Id)
            .RuleFor(c => c.Number, _ => (++roomCounter).ToString())
            .RuleFor(c => c.Capacity, f => f.Random.Short(1, 10))
            .RuleFor(c => c.PricePerNight, f => f.Random.Decimal(50, 5000))
            .RuleFor(c => c.Type, f => f.PickRandom<RoomType>())
            .RuleFor(c => c.Floor, f => f.Random.Short(1, 10))
            .RuleFor(c => c.Description, f => f.Lorem.Paragraph())
            .RuleFor(c => c.IsActive, f => f.Random.Bool());

        var rooms = roomFaker.Generate(300);


        var faker = new Faker();
        // var bookingFaker = new Faker<Booking>();
        var bookings = new List<Booking>();

        for (int i = 0; i < 300; i++)
        {
            var user = faker.PickRandom(users);
            var room = faker.PickRandom(rooms);
            var checkInDate = faker.Date.Future(1);
            var nights = faker.Random.Int(1, 14);
            var checkOutDate = checkInDate.AddDays(nights);

            // TODO: This overlap check needs to be implemented, we need to check the BookingRoom table
            // Check for overlap

            bookings.Add(new Booking
            {
                UserId = user.Id,
                CheckIn = checkInDate,
                CheckOut = checkOutDate,
                Adults = faker.Random.Short(1, room.Capacity),
                Children = faker.Random.Short(0, room.Capacity),
                Status = faker.PickRandom(BookingStatus.Pending, BookingStatus.Confirmed, BookingStatus.Cancelled)
            });
        }

        _context.Users.AddRange(users);
        _context.Hotels.AddRange(hotels);
        _context.Rooms.AddRange(rooms);

        // TODO: Fix adding bookings - "Cannot write DateTime with Kind=Local to PostgreSQL type 'timestamp with time zone', only UTC is supported. Note that it's not possible to mix DateTimes with different Kinds in an array, range, or multirange. (Parameter 'value')"
        // _context.Bookings.AddRange(bookings);

        await _context.SaveChangesAsync();
        return Ok("Database initialized!");
    }


    [HttpDelete("clear")]
    public async Task<IActionResult> ClearDatabase()
    {
        throw new NotImplementedException();
    }
}