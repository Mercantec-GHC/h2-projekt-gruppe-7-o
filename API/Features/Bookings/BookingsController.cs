using API.Data;
using API.Features.Bookings.Services;
using API.Features.Mail.Services;
using API.Mapping;
using API.Models.Dtos;
using API.Models.Entities;
using Humanizer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Text;

namespace API.Controllers;

/// <summary>
/// Controller for managing hotel bookings.
/// </summary>
[Route("api/[controller]")]
[ApiController]
public class BookingsController : ControllerBase
{
    private readonly AppDBContext _context;
    private readonly BookingService _bookingService;

    private readonly ILogger<BookingsController> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="BookingsController"/> class.
    /// </summary>
    /// <param name="context">The database context.</param>
    public BookingsController(AppDBContext context, BookingService bookingService, ILogger<BookingsController> logger)
    {
        _context = context;
        _bookingService = bookingService;

        _logger = logger;
    }

    /// <summary>
    /// Gets all bookings.
    /// </summary>
    /// <returns>List of all bookings.</returns>
    /// <response code="200">Returns the list of bookings.</response>
    [HttpGet]
    // [Authorize(Roles = $"{RoleNames.Admin},{RoleNames.Receptionist}")]
    public async Task<ActionResult<IEnumerable<BookingResponseDto>>> GetBookings()
    {
        var Bookings = await _context.Bookings.ToListAsync();

        var bookingDtos = Bookings.Select(u => u.ToBookingDto()).ToList();
        return bookingDtos;
    }

    /// <summary>
    /// Gets a specific booking by ID.
    /// </summary>
    /// <param name="id">The booking ID.</param>
    /// <returns>The booking with the specified ID.</returns>
    /// <response code="200">Returns the booking.</response>
    /// <response code="404">If the booking is not found.</response>
    [HttpGet("{id}")]
    public async Task<ActionResult<BookingResponseDto>> GetBooking(Guid id)
    {
        var Booking = await _context.Bookings.FindAsync(id);

        if (Booking == null) return NotFound();

        return Booking.ToBookingDto();
    }

    /// <summary>
    /// Updates an existing booking.
    /// </summary>
    /// <param name="id">The booking ID.</param>
    /// <param name="bookingUpdateDto">The updated booking data.</param>
    /// <returns>No content if successful.</returns>
    /// <response code="204">Booking updated successfully.</response>
    /// <response code="404">If the booking is not found.</response>
    /// <response code="400">If the request is invalid.</response>
    [HttpPut("{id}")]
    public async Task<IActionResult> PutBooking(Guid id, BookingUpdateDto dto, CancellationToken ct)
    {
        // Hent booking inkl. Rooms
        var booking = await _context.Bookings
            .Include(b => b.Rooms)
            .FirstOrDefaultAsync(b => b.Id == id, ct);

        if (booking == null)
            return NotFound();

        // Validering af datoer
        if (dto.CheckOut <= dto.CheckIn)
            return BadRequest("Check-out date must be after check-in date.");

        // Opdater felter
        booking.CheckIn = dto.CheckIn;
        booking.CheckOut = dto.CheckOut;
        booking.Adults = dto.Adults;
        booking.Children = dto.Children;

        // Opdater rum, hvis RoomIds er givet
        if (dto.RoomIds != null && dto.RoomIds.Any())
        {
            var rooms = await _context.Rooms
                .Where(r => dto.RoomIds.Contains(r.Id))
                .ToListAsync(ct);

            booking.Rooms.Clear();
            foreach (var room in rooms)
                booking.Rooms.Add(room);
        }

        await _context.SaveChangesAsync(ct);

        return NoContent();
    }


    /// <summary>
    /// Creates a new booking.
    /// </summary>
    /// <param name="bookingCreateDto">The booking data.</param>
    /// <returns>The ID of the created booking.</returns>
    /// <response code="200">Booking created successfully.</response>
    /// <response code="400">If the request is invalid.</response>
    [HttpPost]
    [Authorize] // sørg for, at JWT er påkrævet
    public async Task<ActionResult<Guid>> CreateBooking([FromBody] BookingCreateDto dto)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdString, out var userId))
            return Unauthorized();

        var userEmail = User.FindFirstValue(ClaimTypes.Email);
        var userName = User.FindFirstValue("firstName");
        if (string.IsNullOrEmpty(userEmail) || string.IsNullOrEmpty(userName))
        {
            return Unauthorized("Missing user email or name claim.");
        }

        try
        {
            var bookingId = await _bookingService.CreateBookingAsync(dto, userId, userEmail, userName);

            return Ok(new
            {
                BookingId = bookingId,
                Message = "Booking created successfully and confirmation email sent."
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unexpected error occurred during booking creation.");
            return StatusCode(500, "An internal server error occurred.");
        }
    }

    /// <summary>
    /// Deletes a booking by ID.
    /// </summary>
    /// <param name="id">The booking ID.</param>
    /// <returns>No content if successful.</returns>
    /// <response code="204">Booking deleted successfully.</response>
    /// <response code="404">If the booking is not found.</response>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBooking(Guid id)
    {
        Booking? Booking = await _context.Bookings.FindAsync(id);
        if (Booking == null) return NotFound();

        _context.Bookings.Remove(Booking);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    /// <summary>
    /// Updates an existing booking.
    /// </summary>
    /// <param name="id">The booking ID.</param>
    /// <returns>No content if successful.</returns>
    /// <response code="204">Booking updated successfully.</response>
    /// <response code="404">If the booking is not found.</response>
    /// <response code="400">If the request is invalid.</response>
    [HttpPut("cancel/{id}")]
    [Authorize] // sørg for, at JWT er påkrævet
    public async Task<IActionResult> CancelBooking(Guid id, CancellationToken ct)
    {
        // Hent booking inkl. Rooms
        var booking = await _context.Bookings
            .Include(b => b.Rooms)
            .FirstOrDefaultAsync(b => b.Id == id, ct);

        if (booking == null)
            return NotFound();

        // Validering af datoer
        if (booking.CheckOut <= booking.CheckIn)
            return BadRequest("Check-out date must be after check-in date.");


        var nowUtc = DateTime.UtcNow;
        var checkInUtc = booking.CheckIn.Kind == DateTimeKind.Utc
            ? booking.CheckIn
            : booking.CheckIn.ToUniversalTime();

        TimeSpan untilCheckIn = checkInUtc - nowUtc;

        if (untilCheckIn <= TimeSpan.FromHours(24))
        {
            throw new InvalidOperationException("Cannot cancel the booking within 24 hours of check-in.");
        }

        booking.Status = BookingStatus.Cancelled;


        // Opdater rum, hvis RoomIds er givet

        await _context.SaveChangesAsync(ct);

        return NoContent();
    }


    /// <summary>
    /// Checks if a booking exists by ID.
    /// </summary>
    /// <param name="id">The booking ID.</param>
    /// <returns>True if the booking exists, otherwise false.</returns>
    private bool BookingExists(Guid id)
    {
        return _context.Bookings.Any(e => e.Id == id);
    }
}