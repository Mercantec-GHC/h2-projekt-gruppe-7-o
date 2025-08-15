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

[Route("api/[controller]")]
[ApiController]
public class BookingsController : ControllerBase
{
    private readonly AppDBContext _context;

    public BookingsController(AppDBContext context)
    {
        _context = context;
    }

    // GET: api/Bookings
    [HttpGet]
    // [Authorize(Roles = $"{RoleNames.Admin},{RoleNames.Receptionist}")]
    public async Task<ActionResult<IEnumerable<BookingResponseDto>>> GetBookings()
    {
        var Bookings = await _context.Bookings.ToListAsync();

        var bookingDtos = Bookings.Select(u => u.ToBookingDto()).ToList();
        return bookingDtos;
    }

    // GET: api/Bookings/5
    [HttpGet("{id}")]
    public async Task<ActionResult<BookingResponseDto>> GetBooking(Guid id)
    {
        var Booking = await _context.Bookings.FindAsync(id);

        if (Booking == null) return NotFound();

        return Booking.ToBookingDto();
    }

    // PUT: api/Bookings/5
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
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

    [HttpPost]
    public async Task<ActionResult<Guid>> CreateBooking(BookingCreateDto bookingCreateDto)
    {
        //TODO: The total price should be calculated on the fly (not coming from the cleint) and then stored in the database.
        var Booking = _context.Bookings.Add(bookingCreateDto.ToBooking(0));
        await _context.SaveChangesAsync();

        return Ok(Booking.Entity.Id);
    }


    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBooking(Guid id)
    {
        Booking? Booking = await _context.Bookings.FindAsync(id);
        if (Booking == null) return NotFound();

        _context.Bookings.Remove(Booking);
        await _context.SaveChangesAsync();

        return NoContent();
    }


    private bool BookingExists(Guid id)
    {
        return _context.Bookings.Any(e => e.Id == id);
    }
}