using System.Security.Claims;
using System.Text;
using API.Data;
using API.Mapping;
using API.Models.Dtos;
using API.Models.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;

namespace API.Controllers;

/// <summary>
/// Controller for managing hotel bookings.
/// </summary>
[Route("api/[controller]")]
[ApiController]
public class BookingsController : ControllerBase
{
    private readonly AppDBContext _context;

    /// <summary>
    /// Initializes a new instance of the <see cref="BookingsController"/> class.
    /// </summary>
    /// <param name="context">The database context.</param>
    public BookingsController(AppDBContext context)
    {
        _context = context;
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
    /// Searches for bookings by status and/or date range.
    /// </summary>
    /// <param name="status">Optional booking status to filter by.</param>
    /// <param name="from">Optional start date for check-in filtering.</param>
    /// <param name="to">Optional end date for check-out filtering.</param>
    /// <returns>List of bookings matching the search criteria.</returns>
    /// <response code="200">Returns the list of matching bookings.</response>
    [HttpGet("search")]
    public async Task<ActionResult<IEnumerable<BookingResponseDto>>> SearchBookings(
        [FromQuery] BookingStatus? status,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to)
    {
        IQueryable<Booking> query = _context.Bookings;

        if (status != null)
            query = query.Where(b => b.Status == status);

        if (from != null)
            query = query.Where(b => b.CheckIn >= from);

        if (to != null)
            query = query.Where(b => b.CheckOut <= to);

        var bookings = await query.ToListAsync();
        return bookings.Select(b => b.ToBookingDto()).ToList();
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
    public async Task<IActionResult> PutBooking(Guid id, BookingUpdateDto bookingUpdateDto)
    {
        _context.Entry(bookingUpdateDto).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!BookingExists(id)) return NotFound();

            throw;
        }

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
    public async Task<ActionResult<Guid>> CreateBooking(BookingCreateDto bookingCreateDto)
    {
        //TODO: The total price should be calculated on the fly (not coming from the cleint) and then stored in the database.
        var Booking = _context.Bookings.Add(bookingCreateDto.ToBooking(0));
        await _context.SaveChangesAsync();

        return Ok(Booking.Entity.Id);
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
    /// Checks if a booking exists by ID.
    /// </summary>
    /// <param name="id">The booking ID.</param>
    /// <returns>True if the booking exists, otherwise false.</returns>
    private bool BookingExists(Guid id)
    {
        return _context.Bookings.Any(e => e.Id == id);
    }
}