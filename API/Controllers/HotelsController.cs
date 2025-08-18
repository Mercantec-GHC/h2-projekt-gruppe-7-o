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
/// Controller for managing hotels.
/// </summary>
[Route("api/[controller]")]
[ApiController]
public class HotelsController : ControllerBase
{
    private readonly AppDBContext _context;

    /// <summary>
    /// Initializes a new instance of the <see cref="HotelsController"/> class.
    /// </summary>
    /// <param name="context">The database context.</param>
    public HotelsController(AppDBContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Gets all hotels.
    /// </summary>
    /// <returns>List of all hotels.</returns>
    /// <response code="200">Returns the list of hotels.</response>
    [HttpGet]
    [Authorize(Roles = $"{RoleNames.Admin},{RoleNames.Receptionist}")]
    public async Task<ActionResult<IEnumerable<HotelResponseDto>>> GetHotels()
    {
        var Hotels = await _context.Hotels.ToListAsync();

        return Hotels.Select(u => u.ToHotelDto()).ToList();
    }

    /// <summary>
    /// Gets a specific hotel by ID.
    /// </summary>
    /// <param name="id">The hotel ID.</param>
    /// <returns>The hotel with the specified ID.</returns>
    /// <response code="200">Returns the hotel.</response>
    /// <response code="404">If the hotel is not found.</response>
    [HttpGet("{id}")]
    public async Task<ActionResult<HotelResponseDto>> GetHotel(Guid id)
    {
        var Hotel = await _context.Hotels.FindAsync(id);

        if (Hotel == null) return NotFound();

        return Hotel.ToHotelDto();
    }

    /// <summary>
    /// Updates an existing hotel.
    /// </summary>
    /// <param name="id">The hotel ID.</param>
    /// <param name="hotelUpdateDto">The updated hotel data.</param>
    /// <returns>No content if successful.</returns>
    /// <response code="204">Hotel updated successfully.</response>
    /// <response code="404">If the hotel is not found.</response>
    /// <response code="400">If the request is invalid.</response>
    [HttpPut("{id}")]
    public async Task<IActionResult> PutHotel(Guid id, HotelUpdateDto hotelUpdateDto)
    {
        _context.Entry(hotelUpdateDto).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!HotelExists(id)) return NotFound();

            throw;
        }

        return NoContent();
    }

    /// <summary>
    /// Deletes a hotel by ID.
    /// </summary>
    /// <param name="id">The hotel ID.</param>
    /// <returns>No content if successful.</returns>
    /// <response code="204">Hotel deleted successfully.</response>
    /// <response code="404">If the hotel is not found.</response>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteHotel(Guid id)
    {
        Hotel? Hotel = await _context.Hotels.FindAsync(id);
        if (Hotel == null) return NotFound();

        _context.Hotels.Remove(Hotel);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    /// <summary>
    /// Creates a new hotel.
    /// </summary>
    /// <param name="hotelCreateDto">The hotel data.</param>
    /// <returns>The ID of the created hotel.</returns>
    /// <response code="200">Hotel created successfully.</response>
    /// <response code="400">If a hotel with the same email already exists.</response>
    [HttpPost]
    public async Task<ActionResult<Hotel>> CreateHotel(HotelCreateDto hotelCreateDto)
    {
        if (_context.Hotels.Any(u => u.Email == hotelCreateDto.Email))
        {
            return BadRequest("A Hotel with that email already exists");
        }

        var hotel = _context.Hotels.Add(hotelCreateDto.ToHotel());
        await _context.SaveChangesAsync();

        return Ok(new { message = "Hotel created successfully", hotel.Entity.Id });
    }

    /// <summary>
    /// Checks if a hotel exists by ID.
    /// </summary>
    /// <param name="id">The hotel ID.</param>
    /// <returns>True if the hotel exists, otherwise false.</returns>
    private bool HotelExists(Guid id)
    {
        return _context.Hotels.Any(e => e.Id == id);
    }
}