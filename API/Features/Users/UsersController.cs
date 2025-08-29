using System.Security.Claims;
using API.Data;
using API.Mapping;
using API.Models.Dtos;
using API.Models.Entities;
using API.Repositories;
using API.Services;
using API.Services.Password;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using JwtRegisteredClaimNames = Microsoft.IdentityModel.JsonWebTokens.JwtRegisteredClaimNames;

namespace API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class UsersController : ControllerBase
{
    private readonly AppDBContext _context;
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHashingService _passwordHashingService;

    public UsersController(AppDBContext context, IUserRepository userRepository,
        IPasswordHashingService passwordHashingService)
    {
        _context = context;
        _userRepository = userRepository;
        _passwordHashingService = passwordHashingService;
    }

    /// <summary>
    /// Retrieves all users
    /// </summary>
    /// <returns>A list of all users</returns>
    /// <response code="200">Returns the list of users</response>
    /// <response code="401">If the user is not authenticated</response>
    /// <response code="403">If the user doesn't have the required role (Admin or Receptionist)</response>
    [HttpGet]
    [Authorize(Roles = $"{RoleNames.Admin},{RoleNames.Receptionist}")]
    public async Task<ActionResult<IReadOnlyList<UserReponseDto>>> GetUsers(CancellationToken ct)
    {
        var users = await _userRepository.GetAllAsync(ct);

        return users.Select(u => u.ToUserDto()).ToList();
    }

    /// <summary>
    /// Retrieves a specific user by their unique identifier
    /// </summary>
    /// <param name="id">The unique identifier of the user</param>
    /// <returns>The requested user information</returns>
    /// <response code="200">Returns the requested user</response>
    /// <response code="401">If the user is not authenticated</response>
    /// <response code="403">If the user is not an admin and not the owner of the resource</response>
    /// <response code="404">If no user is found with the specified ID</response>
    [HttpGet("{id}")]
    // TODO: add Auth for Owner validation
    // [AuthorizeAdminOrOwner]
    public async Task<ActionResult<UserReponseDto>> GetUser(Guid id)
    {
        var user = await _userRepository.GetByIdAsync(id);

        if (user == null) return NotFound();

        return user.ToUserDto();
    }

    /// <summary>
    /// Updates an existing user's information
    /// </summary>
    /// <param name="id">The unique identifier of the user to update</param>
    /// <param name="userUpdateDto">The updated user information</param>
    /// <returns>No content if the update was successful</returns>
    /// <response code="204">If the user was updated successfully</response>
    /// <response code="400">If the ID in the URL doesn't match the ID in the request body</response>
    /// <response code="401">If the user is not authenticated</response>
    /// <response code="404">If no user is found with the specified ID</response>
    [HttpPut("{id}")]
    // TODO: add Auth for Owner validation
    // [AuthorizeAdminOrOwner]
    public async Task<IActionResult> PutUser(Guid id, UserUpdateDto userUpdateDto)
    {
        try
        {
            await _userRepository.UpdateUserAsync(id, userUpdateDto);
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!UserExists(id)) return NotFound();

            throw;
        }

        return NoContent();
    }


    /// <summary>
    /// Deletes a specific user
    /// </summary>
    /// <param name="id">The unique identifier of the user to delete</param>
    /// <returns>No content if the deletion was successful</returns>
    /// <response code="204">If the user was deleted successfully</response>
    /// <response code="401">If the user is not authenticated</response>
    /// <response code="403">If the user is not an admin and not the owner of the resource</response>
    /// <response code="404">If no user is found with the specified ID</response>
    [HttpDelete("{id}")]
    // TODO: add Auth for Owner validation
    // [AuthorizeAdminOrOwner]
    public async Task<IActionResult> DeleteUser(Guid id)
    {
        var user = await _userRepository.DeleteByIdAsync(id);

        if (user == null) return NotFound();

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    /// <summary>
    /// Retrieves the current authenticated user's information
    /// </summary>
    /// <returns>The current user's information</returns>
    /// <response code="200">Returns the current user's information</response>
    /// <response code="401">If the user is not authenticated</response>
    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentUser()
    {
        // 1. Get user id from token
        // TODO: couldn't get getting the id to work with the JwtRegisteredClaimNames.Sub, can we fix this?
        // TODO: can we get the current user id in an easier way than having to constantly look it up in the token? Can we extract this to some kind of service?
        var userId =
            User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value ??
            User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (userId == null)
            return Unauthorized("UserId missing from token");

        if (!Guid.TryParse(userId, out var guid)) return BadRequest("Invalid user id");
        // 2. Find the user in the database
        var user = await _userRepository.GetByIdAsync(guid);

        if (user == null)
            return NotFound("User Not found");

        return Ok(new
        {
            user.Id,
            user.Email,
            user.CreatedAt,
            user.LastLogin,
            Role = user.Role.Name,
            Bookings = user.Bookings.Select(b => new
            {
                b.Id,
                b.CheckIn,
                b.CheckOut,
                b.CreatedAt,
                b.UpdatedAt,
                Rooms = b.Rooms.Select(r => new
                {
                    r.Id,
                    r.Type,
                    r.Floor,
                    r.Number,
                    r.PricePerNight,
                    r.Description
                })
            }).ToList()
        });
        // 3. Return the users information
    }

    private bool UserExists(Guid id)
    {
        return _context.Users.Any(e => e.Id == id);
    }
}