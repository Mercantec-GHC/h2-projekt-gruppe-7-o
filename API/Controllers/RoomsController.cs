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

    /// <summary>
    /// Retrieves all rooms in the system
    /// </summary>
    /// <returns>A list of all rooms</returns>
    /// <response code="200">Returns the list of rooms</response>
    /// <response code="401">If the user is not authenticated</response>
    /// <response code="403">If the user doesn't have the required role (Admin or Receptionist)</response>
    [HttpGet]
    [Authorize(Roles = $"{RoleNames.Admin},{RoleNames.Receptionist}")]
    public async Task<ActionResult<IEnumerable<RoomResponseDto>>> GetRooms()
    {
        var Rooms = await _context.Rooms.ToListAsync();

        return Rooms.Select(u => u.ToRoomDto()).ToList();
    }

    /// <summary>
    /// Retrieves a specific room by its unique identifier
    /// </summary>
    /// <param name="id">The unique identifier of the room</param>
    /// <returns>The requested room information</returns>
    /// <response code="200">Returns the requested room</response>
    /// <response code="401">If the user is not authenticated</response>
    /// <response code="403">If the user doesn't have the required role (Admin or Receptionist)</response>
    /// <response code="404">If no room is found with the specified ID</response>
    [HttpGet("{id}")]
    [Authorize(Roles = $"{RoleNames.Admin},{RoleNames.Receptionist}")]
    public async Task<ActionResult<RoomResponseDto>> GetRoom(Guid id)
    {
        var Room = await _context.Rooms.FindAsync(id);

        if (Room == null) return NotFound();

        return Room.ToRoomDto();
    }

    /// <summary>
    /// Creates a new room in the system
    /// </summary>
    /// <param name="roomCreateDto">The room information to create</param>
    /// <returns>A success message and the created room's ID</returns>
    /// <response code="200">If the room was created successfully</response>
    /// <response code="400">If the room data is invalid</response>
    /// <response code="401">If the user is not authenticated</response>
    /// <response code="403">If the user doesn't have the Admin role</response>
    [HttpPost]
    [Authorize(Roles = $"{RoleNames.Admin}")]
    public async Task<ActionResult<Room>> CreateRoom(RoomCreateDto roomCreateDto)
    {
        var Room = _context.Rooms.Add(roomCreateDto.ToRoom());
        await _context.SaveChangesAsync();

        return Ok(new { message = "Room created successfully", Room.Entity.Id });
    }


    /// <summary>
    /// Updates an existing room's information
    /// </summary>
    /// <param name="id">The unique identifier of the room to update</param>
    /// <param name="roomUpdateDto">The updated room information</param>
    /// <returns>No content if the update was successful</returns>
    /// <response code="204">If the room was updated successfully</response>
    /// <response code="400">If the ID in the URL doesn't match the ID in the request body</response>
    /// <response code="401">If the user is not authenticated</response>
    /// <response code="403">If the user doesn't have the Admin role</response>
    /// <response code="404">If no room is found with the specified ID</response>
    [HttpPut("{id}")]
    [Authorize(Roles = $"{RoleNames.Admin}")]
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


    /// <summary>
    /// Deletes a specific room from the system
    /// </summary>
    /// <param name="id">The unique identifier of the room to delete</param>
    /// <returns>No content if the deletion was successful</returns>
    /// <response code="204">If the room was deleted successfully</response>
    /// <response code="401">If the user is not authenticated</response>
    /// <response code="403">If the user doesn't have the Admin role</response>
    /// <response code="404">If no room is found with the specified ID</response>
    [HttpDelete("{id}")]
    [Authorize(Roles = $"{RoleNames.Admin}")]
    public async Task<IActionResult> DeleteRoom(Guid id)
    {
        Room? Room = await _context.Rooms.FindAsync(id);
        if (Room == null) return NotFound();

        _context.Rooms.Remove(Room);
        await _context.SaveChangesAsync();

        return NoContent();
    }


    private bool RoomExists(Guid id)
    {
        return _context.Rooms.Any(e => e.Id == id);
    }
}