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
    private readonly HotelsSeeder _hotelsSeeder;

    public SeedersController(AppDBContext context, UsersSeeder usersSeeder, HotelsSeeder hotelsSeeder,
        IPasswordHashingService passwordHashingService)
    {
        _context = context;
        _usersSeeder = usersSeeder;
        _hotelsSeeder = hotelsSeeder;
        _passwordHashingService = passwordHashingService;
    }


    /// <summary>
    ///    Seeds the database with the specified number of users
    /// </summary>
    /// <param name="count"></param>
    /// <response code="204">{count} Users seeded!</response>
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

    /// <summary>
    ///    Seeds the database with the specified number of hotels
    /// </summary>
    /// <param name="count"></param>
    /// <response code="204">{count} Users seeded!</response>
    [HttpPost("hotels")]
    public async Task<IActionResult> SeedHotels()
    {
        try
        {
            var hotels = await _hotelsSeeder.SeedAsync();
            return Ok($"{hotels.Count} Hotels seeded with rooms!");
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("init")]
    public async Task<IActionResult> InitializeDatabase()
    {
        var usedEmails = new HashSet<string>();
        var userFaker = new Faker<User>()
            .RuleFor(c => c.Id, _ => Guid.NewGuid())
            .RuleFor(c => c.FirstName, f => f.Name.FirstName())
            .RuleFor(c => c.LastName, f => f.Name.LastName())
            .RuleFor(c => c.Email, f =>
            {
                string email;
                do
                {
                    email = f.Internet.Email().ToLower();
                } while (usedEmails.Contains(email));

                usedEmails.Add(email);
                return email;
            })
            .RuleFor(c => c.HashedPassword, _ => _passwordHashingService.Hash("12345678"))
            .RuleFor(c => c.RoleId, f => f.Random.Int(1, 4));
        var users = userFaker.Generate(50);


        var hotelFaker = new Faker<Hotel>()
            .RuleFor(c => c.Id, _ => Guid.NewGuid())
            .RuleFor(c => c.Name, f => f.Name.FirstName())
            .RuleFor(c => c.Email, (_, c) => c.Name.ToLower() + "@" + "kabdikhan.com")
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
            var checkInDate = faker.Date.Future(1).ToUniversalTime();
            var nights = faker.Random.Int(1, 14);
            var checkOutDate = checkInDate.AddDays(nights).ToUniversalTime();

            // TODO: This overlap check needs to be implemented, we need to check the BookingRoom table
            // Check for overlap

            // TODO: we need to implement booking lines for each booking as well

            // TODO: This should populate in the BookingRoom table as well, it is not
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

        // TODO: uncomment when BookingRoom is being populated correctly, and when BookingLine is implemented
        // _context.Bookings.AddRange(bookings);

        await _context.SaveChangesAsync();
        return Ok("Database initialized!");
    }


    /// <summary>
    /// Deletes all data from the database.
    /// </summary>
    /// <returns>No content if successful.</returns>
    /// <response code="204">Database cleared successfully.</response>
    [HttpDelete("clear")]
    public async Task<IActionResult> ClearDatabase()
    {
        try
        {
            // Tables to OMIT from clearing (actual DB table names)
            var tablesToOmit = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            {
                "Roles",
            };

            // Collect distinct mapped tables (skip owned/keyless)
            var tables = _context.Model.GetEntityTypes()
                .Where(et => !et.IsOwned())
                .Select(et => new
                {
                    Schema = et.GetSchema(), // null or "public" or custom
                    Table = et.GetTableName() // actual table name
                })
                .Where(x => x.Table != null)
                .Distinct()
                .ToList();

            // Build list of tables to truncate
            var toTruncate = tables
                .Where(x => !tablesToOmit.Contains(x.Table!))
                .Select(x =>
                {
                    // Quote identifiers for PostgreSQL (preserves exact case/snake_case)
                    var schema = string.IsNullOrWhiteSpace(x.Schema) ? null : $"\"{x.Schema}\".";
                    return $"{schema}\"{x.Table}\"";
                })
                .ToList();

            if (toTruncate.Count == 0)
                return Ok("Nothing to clear.");

            // One statement to truncate all selected tables and reset identities
            var sql = $"TRUNCATE TABLE {string.Join(", ", toTruncate)} RESTART IDENTITY;";

            await _context.Database.ExecuteSqlRawAsync(sql);

            return Ok("Database cleared successfully.");
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
}