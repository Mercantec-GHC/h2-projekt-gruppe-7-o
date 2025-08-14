using API.Data;
using API.Database.Services;
using API.Mapping;
using API.Models.Dtos;
using API.Models.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Text;

namespace API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class UsersController : ControllerBase
{
    private readonly AppDBContext _context;
    private readonly JwtService _jwtService;

    public UsersController(AppDBContext context, JwtService jwtService)
    {
        _context = context;
        _jwtService = jwtService;
    }

    // GET: api/Users
    [HttpGet]
    [Authorize(Roles = $"{RoleNames.Admin},{RoleNames.Receptionist}")]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetUsers()
    {
        var users = await _context.Users.ToListAsync();

        return users.Select(u => u.ToUserDto()).ToList();
    }

    // GET: api/Users/5
    [HttpGet("{id}")]
    public async Task<ActionResult<UserDto>> GetUser(Guid id)
    {
        var user = await _context.Users.FindAsync(id);

        if (user == null) return NotFound();

        return user.ToUserDto();
    }

    // PUT: api/Users/5
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPut("{id}")]
    public async Task<IActionResult> PutUser(Guid id, User user)
    {
        if (id != user.Id) return BadRequest();

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

    // TODO: this does not work yet, since we need to have a seeder for our roles, and input that when creating a new user (can this be done automatically from the User entity?)
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
    public async Task<ActionResult> LoginUser(LoginDto loginDto)
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
        // Generer JWT token
        var token = _jwtService.GenerateToken(user);

        return Ok(new
        {
            message = "Login godkendt!",
            token = token,
            user = new
            {
                id = user.Id,
                email = user.Email,
                username = user.FirstName,
                role = user.Role?.Name ?? "User"
            }
        });
    }

    private bool UserExists(Guid id)
    {
        return _context.Users.Any(e => e.Id == id);
    }
}