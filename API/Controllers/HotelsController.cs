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
public class HotelsController : ControllerBase
{
    private readonly AppDBContext _context;

    public HotelsController(AppDBContext context)
    {
        _context = context;
    }

    // GET: api/Hotels
    [HttpGet]
    [Authorize(Roles = $"{RoleNames.Admin},{RoleNames.Receptionist}")]
    public async Task<ActionResult<IEnumerable<HotelResponseDto>>> GetHotels()
    {
        var Hotels = await _context.Hotels.ToListAsync();

        return Hotels.Select(u => u.ToHotelDto()).ToList();
    }

    // GET: api/Hotels/5
    [HttpGet("{id}")]
    public async Task<ActionResult<HotelResponseDto>> GetHotel(Guid id)
    {
        var Hotel = await _context.Hotels.FindAsync(id);

        if (Hotel == null) return NotFound();

        return Hotel.ToHotelDto();
    }

    // PUT: api/Hotels/5
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
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


    // DELETE: api/Hotels/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteHotel(Guid id)
    {
        Hotel? Hotel = await _context.Hotels.FindAsync(id);
        if (Hotel == null) return NotFound();

        _context.Hotels.Remove(Hotel);
        await _context.SaveChangesAsync();

        return NoContent();
    }

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


    private bool HotelExists(Guid id)
    {
        return _context.Hotels.Any(e => e.Id == id);
    }
}