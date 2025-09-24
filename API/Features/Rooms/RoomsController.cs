using API.Data;
using API.Mapping;
using API.Models.Dtos;
using API.Models.Entities;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;


namespace API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class RoomsController : ControllerBase
{
    private readonly AppDBContext _context;
    private readonly IMemoryCache _cache;
    private readonly RoomService _roomService;

    public RoomsController(AppDBContext context, IMemoryCache cache, RoomService roomService)
    {
        _context = context;
        _cache = cache;
        _roomService = roomService;
    }

    /// <summary>
    /// Retrieves all rooms
    /// </summary>
    /// <returns>A list of all rooms</returns>
    /// <response code="200">Returns the list of rooms</response>
    /// <response code="401">If the user is not authenticated</response>
    /// <response code="403">If the user doesn't have the required role (Admin or Receptionist)</response>
    [HttpGet]
    [Authorize(Roles = $"{RoleNames.Admin},{RoleNames.Receptionist}")]
    public async Task<ActionResult<IEnumerable<RoomResponseDto>>> GetRooms()
    {
        string cacheKey = "all_rooms";

        // try to get from cache
        if (_cache.TryGetValue(cacheKey, out List<Room> cachedRooms))
        {
            return Ok(cachedRooms);
        }

        var rooms = await _context.Rooms.ToListAsync();

        _cache.Set(cacheKey, rooms, TimeSpan.FromSeconds(30));

        return rooms.Select(r => r.ToRoomDto()).ToList();
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
        var room = await _context.Rooms.FindAsync(id);

        if (room == null) return NotFound();

        return room.ToRoomDto();
    }

    /// <summary>
    /// Creates a new rooom
    /// </summary>
    /// <param name="roomCreateDto">The room information to create</param>
    /// <returns>A success message and the created room's ID</returns>
    /// <response code="200">If the room was created successfully</response>
    /// <response code="400">If the room data is invalid</response>
    /// <response code="401">If the user is not authenticated</response>
    /// <response code="403">If the user doesn't have the Admin role</response>
    [HttpPost]
    [Authorize(Roles = $"{RoleNames.Admin}")]
    public async Task<ActionResult<RoomResponseDto>> CreateRoom(RoomCreateDto roomCreateDto)
    {
        var room = roomCreateDto.ToRoom();
        _context.Rooms.Add(room);
        await _context.SaveChangesAsync();

        _cache.Remove("all_rooms");

        return CreatedAtAction(nameof(GetRoom), new { id = room.Id }, room.ToRoomDto());
    }


    /// <summary>
    /// Gets available rooms in a given hotel for a specific date range
    /// </summary>
    /// <param name="hotelId">The unique identifier of the hotel</param>
    /// <param name="checkIn">The check-in date of the booking</param>
    /// <param name="checkOut">Thecheck-out date of the booking</param>
    /// <returns>A list of available rooms</returns>
    /// <response code="200">Returns a list of available rooms</response>
    /// <response code="400">If the parameters are invalid</response>
    /// <response code="404">If no rooms exist for the given hotel</response>
    [HttpGet("availability")]
    // [Authorize(Roles = $"{RoleNames.Admin},{RoleNames.Receptionist}")]
    public async Task<ActionResult<IEnumerable<AvailabilityResponseDto>>> GetAvailableRooms(
        [FromQuery] Guid hotelId,
        [FromQuery] DateTime? checkIn = null,
        [FromQuery] DateTime? checkOut = null
    )

    {
        var rooms = await _roomService.GetAvailableRoomsAsync(hotelId, checkIn, checkOut);
        return Ok(rooms);
    }

    /// <summary>
    /// Gets available rooms in a given hotel for a specific date range
    /// </summary>
    /// <param name="hotelId">The unique identifier of the hotel</param>
    /// <param name="checkIn">The check-in date of the booking</param>
    /// <param name="checkOut">Thecheck-out date of the booking</param>
    /// <returns>A list of available rooms</returns>
    /// <response code="200">Returns a list of available rooms</response>
    /// <response code="400">If the parameters are invalid</response>
    /// <response code="404">If no rooms exist for the given hotel</response>
    [HttpGet("availability/types")]
    // [Authorize(Roles = $"{RoleNames.Admin},{RoleNames.Receptionist}")]
    public async Task<ActionResult<IEnumerable<RoomTypesAvailablityResponseDto>>> GetAvailableRoomTypes(
        [FromQuery] Guid hotelId,
        [FromQuery] DateTime checkIn,
        [FromQuery] DateTime checkOut
    )

    {
        var rooms = await _roomService.GetAvailableRoomTypesAsync(hotelId, checkIn, checkOut);
        return Ok(rooms);
    }


    /// <summary>
    /// Gets booked (unavailable) rooms in a given hotel for a specific date range
    /// </summary>
    /// <param name="hotelId">The unique identifier of the hotel</param>
    /// <param name="startDate">The start date of the booking</param>
    /// <param name="endDate">The end date of the booking</param>
    /// <returns>A list of unavailable rooms</returns>
    /// <response code="200">Returns a list of unavailable rooms</response>
    /// <response code="400">If the parameters are invalid</response>
    /// <response code="404">If no rooms exist for the given hotel</response>
    [HttpGet("unavailable")]
    [Authorize(Roles = $"{RoleNames.Admin},{RoleNames.Receptionist}")]
    public async Task<ActionResult<IEnumerable<RoomResponseDto>>> GetUnavailableRooms(
        [FromQuery] Guid? hotelId = null,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        var rooms = await _roomService.GetUnavailableRoomsAsync(hotelId, startDate, endDate);
        return Ok(rooms);
    }


    /// <summary>
    /// Updates an existing room's information
    /// </summary>
    /// <param name="id">The unique identifier of the room to update</param>
    /// <param name="roomUpdateDto">The updated room information</param>
    /// <returns>
    /// 204 No Content if the update was successful,
    /// 404 Not Found if no room exists with the specified ID,
    /// 400 Bad Request if the update violates constraints or fails.
    /// </returns>
    /// <response code="204">If the room was updated successfully</response>
    /// <response code="400">If the ID in the URL doesn't match the ID in the request body</response>
    /// <response code="401">If the user is not authenticated</response>
    /// <response code="403">If the user doesn't have the Admin role</response>
    /// <response code="404">If no room is found with the specified ID</response>
    [HttpPut("{id}")]
    [Authorize(Roles = $"{RoleNames.Admin},{RoleNames.Receptionist}")]
    public async Task<IActionResult> PutRoom(Guid id, RoomUpdateDto roomUpdateDto)
    {
        var room = await _context.Rooms.FindAsync(id);
        if (room == null) return NotFound();

        // Opdater entity med mapping-metoden
        room.UpdateRoom(roomUpdateDto);

        try
        {
            await _context.SaveChangesAsync();
            _cache.Remove("all_rooms");
        }
        catch (DbUpdateException ex)
        {
            // F.eks. håndtering af unik constraint på Number
            return BadRequest(new { message = ex.InnerException?.Message ?? ex.Message });
        }

        return NoContent();
    }


    /// <summary>
    /// Deletes a specific room
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
        var success = await _roomService.DeleteRoomAsync(id);
        if (!success) return NotFound();
        return NoContent();
    }


    private bool RoomExists(Guid id)
    {
        return _context.Rooms.Any(e => e.Id == id);
    }
}