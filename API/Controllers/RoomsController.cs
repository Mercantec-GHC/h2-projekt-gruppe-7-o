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
public class RoomsController : ControllerBase
{
    private readonly AppDBContext _context;

    public RoomsController(AppDBContext context)
    {
        _context = context;
    }

    // GET: api/Rooms
    [HttpGet]
    [Authorize(Roles = $"{RoleNames.Admin},{RoleNames.Receptionist}")]
    public async Task<ActionResult<IEnumerable<RoomResponseDto>>> GetRooms()
    {
        var Rooms = await _context.Rooms.ToListAsync();

        return Rooms.Select(u => u.ToRoomDto()).ToList();
    }

    // GET: api/Rooms/5
    [HttpGet("{id}")]
    public async Task<ActionResult<RoomResponseDto>> GetRoom(Guid id)
    {
        var Room = await _context.Rooms.FindAsync(id);

        if (Room == null) return NotFound();

        return Room.ToRoomDto();
    }

    // PUT: api/Rooms/5
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPut("{id}")]
    public async Task<IActionResult> PutRoom(Guid id, RoomUpdateDto roomUpdateDto)
    {
        _context.Entry(roomUpdateDto).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!RoomExists(id)) return NotFound();

            throw;
        }

        return NoContent();
    }


    // DELETE: api/Rooms/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteRoom(Guid id)
    {
        Room? Room = await _context.Rooms.FindAsync(id);
        if (Room == null) return NotFound();

        _context.Rooms.Remove(Room);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost]
    public async Task<ActionResult<Room>> CreateRoom(RoomCreateDto roomCreateDto)
    {
        var Room = _context.Rooms.Add(roomCreateDto.ToRoom());
        await _context.SaveChangesAsync();

        return Ok(new { message = "Room created successfully", Room.Entity.Id });
    }


    private bool RoomExists(Guid id)
    {
        return _context.Rooms.Any(e => e.Id == id);
    }
}