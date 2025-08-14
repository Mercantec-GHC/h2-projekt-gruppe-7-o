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

    // GET: api/Users
    [HttpGet]
    [Authorize(Roles = $"{RoleNames.Admin},{RoleNames.Receptionist}")]
    public async Task<ActionResult<IEnumerable<UserReponseDto>>> GetUsers()
    {
        var users = await _context.Users.ToListAsync();

        return users.Select(u => u.ToUserDto()).ToList();
    }

    // GET: api/Users/5
    [HttpGet("{id}")]
    public async Task<ActionResult<UserReponseDto>> GetUser(Guid id)
    {
        var user = await _context.Users.FindAsync(id);

        if (user == null) return NotFound();

        return user.ToUserDto();
    }

    // PUT: api/Users/5
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPut("{id}")]
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


    // DELETE: api/Users/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(Guid id)
    {
        User? user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound();

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    /// <summary>
    /// Get the information about the current user based on the JWT token
    /// </summary>
    /// <returns>Brugerens information</returns>
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


    [HttpPost("login")]
    public async Task<ActionResult<string>> LoginUser(LoginDto loginDto, JwtService jwtService)
    {
        // TODO: instead of using FirstOrDefaultAsync, can we create our own extension method (i.e: GetByEmail?) 
        User? user = await _context.Users.Include(user => user.Role)
            .FirstOrDefaultAsync(u => u.Email == loginDto.Email);

        if (user == null) return NotFound();

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