using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using API.Data;
using API.Mapping;
using API.Models.Dtos;
using API.Models.Entities;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using JwtRegisteredClaimNames = Microsoft.IdentityModel.JsonWebTokens.JwtRegisteredClaimNames;

namespace API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class UsersController : ControllerBase
{
    private readonly AppDBContext _context;

    public UsersController(AppDBContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Retrieves all users in the system
    /// </summary>
    /// <returns>A list of all users</returns>
    /// <response code="200">Returns the list of users</response>
    /// <response code="401">If the user is not authenticated</response>
    /// <response code="403">If the user doesn't have the required role (Admin or Receptionist)</response>
    [HttpGet]
    [Authorize(Roles = $"{RoleNames.Admin},{RoleNames.Receptionist}")]
    public async Task<ActionResult<IEnumerable<UserReponseDto>>> GetUsers()
    {
        var users = await _context.Users.ToListAsync();

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
        var user = await _context.Users.FindAsync(id);

        if (user == null) return NotFound();

        return user.ToUserDto();
    }

    /// <summary>
    /// Updates an existing user's information
    /// </summary>
    /// <param name="id">The unique identifier of the user to update</param>
    /// <param name="user">The updated user information</param>
    /// <returns>No content if the update was successful</returns>
    /// <response code="204">If the user was updated successfully</response>
    /// <response code="400">If the ID in the URL doesn't match the ID in the request body</response>
    /// <response code="401">If the user is not authenticated</response>
    /// <response code="404">If no user is found with the specified ID</response>
    [HttpPut("{id}")]
    // TODO: add Auth for Owner validation
    // [AuthorizeAdminOrOwner]
    public async Task<IActionResult> PutUser(Guid id, UserUpdateDto user)
    {
        _context.Entry(user).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!UserExists(id)) return NotFound();

            throw;
        }

        return NoContent();
    }

    /// <summary>
    /// Deletes a specific user from the system
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
        User? user = await _context.Users.FindAsync(id);
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

        // 2. Find the user in the database
        var user = await _context.Users
            .Include(u => u.Role)
            .Include(u => u.Bookings)
            .ThenInclude(b => b.Rooms)
            .FirstOrDefaultAsync(u => u.Id.ToString() == userId);

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

    /// <summary>
    /// Registers a new user in the system
    /// </summary>
    /// <param name="registerDto">The user registration information</param>
    /// <returns>A success message and the registered email</returns>
    /// <response code="200">If the user was registered successfully</response>
    /// <response code="400">If the email is already registered</response>
    [HttpPost("register")]
    public async Task<ActionResult<User>> RegisterUser(RegisterDto registerDto)
    {
        if (_context.Users.Any(u => u.Email == registerDto.Email))
        {
            return BadRequest("A user with that email already exists");
        }

        string hashedPassword = BCrypt.Net.BCrypt.HashPassword(registerDto.Password);

        var roleId = await _context.Roles
            .Where(r => r.Name == RoleNames.Customer)
            .Select(r => r.Id)
            .SingleOrDefaultAsync();


        User user = new User
        {
            Email = registerDto.Email,
            HashedPassword = hashedPassword,
            FirstName = registerDto.FirstName,
            LastName = registerDto.LastName,
            RoleId = roleId,
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return Ok(new { message = "User created successfully", user.Email });
    }


    /// <summary>
    /// Authenticates a user and returns a JWT token
    /// </summary>
    /// <param name="loginDto">The user login credentials</param>
    /// <returns>A JWT token for authentication</returns>
    /// <response code="200">Returns the JWT token</response>
    /// <response code="400">If the request is invalid</response>
    /// <response code="401">If the email or password is incorrect, or the user is not found</response>
    [HttpPost("login")]
    public async Task<ActionResult<string>> LoginUser(LoginDto loginDto, JwtService jwtService)
    {
        // TODO: instead of using FirstOrDefaultAsync, can we create our own extension method (i.e: GetByEmail?) 
        User? user = await _context.Users.Include(user => user.Role)
            .FirstOrDefaultAsync(u => u.Email == loginDto.Email);

        if (user == null) return Unauthorized("Incorrect email or password");

        bool isPasswordCorrect = BCrypt.Net.BCrypt.Verify(loginDto.Password, user.HashedPassword);

        if (!isPasswordCorrect) return Unauthorized("Incorrect email or password");

        user.LastLogin = DateTimeOffset.UtcNow;


        _context.Users.Update(user);
        await _context.SaveChangesAsync();

        var token = jwtService.GenerateToken(user);
        //TODO: maybe we want to return more than just the token 
        return Ok(token);
    }

    private bool UserExists(Guid id)
    {
        return _context.Users.Any(e => e.Id == id);
    }

    private bool UserEmailExists(Guid id, string email)
    {
        return _context.Users.Any(e => e.Email == email && e.Id != id);
    }
}