using API.Data;
using API.Mapping;
using API.Models.Dtos;
using API.Models.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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
    public async Task<ActionResult<User>> LoginUser(LoginDto loginDto)
    {
        User? user = await _context.Users.FirstOrDefaultAsync(u => u.Email == loginDto.Email);

        if (user == null) return NotFound();

        bool isPasswordCorrect = BCrypt.Net.BCrypt.Verify(loginDto.Password, user.HashedPassword);

        if (!isPasswordCorrect) return Unauthorized("Incorrect email or password");

        user.LastLogin = DateTimeOffset.UtcNow;


        _context.Users.Update(user);
        await _context.SaveChangesAsync();


        //TODO: implement JWT, redirect to dashboard?
        return Ok(new { message = "User logged in successfully", user.Email });
    }

    private bool UserExists(Guid id)
    {
        return _context.Users.Any(e => e.Id == id);
    }
}