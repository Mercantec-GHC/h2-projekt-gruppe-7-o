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
    public async Task<ActionResult<string>> LoginUser(LoginDto loginDto)
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


        //TODO: implement JWT, redirect to dashboard?
        // MOVE ALL OF THIS LOGIC TO A JWT SERVICE
        // STILL GETTING "INVALID SIGNATURE" WHEN TESTING ON JWT.IO
        // https://www.youtube.com/watch?v=6DWJIyipxzw&ab_channel=MilanJovanovi%C4%87

        var securityKey =
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes("super-duper-secret-key-that-should-also-be-fairly-long"));

        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity([
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                // new Claim("email_verified", user.EmailVerified.ToString()),
                new Claim(ClaimTypes.Role, user.Role.Name)
            ]),
            Expires = DateTime.UtcNow.AddMinutes(60),
            // Expires = DateTime.UtcNow.AddMinutes(ConfigurationBinder.GetValue<int>("Jwt:ExpiresInMinutes")),
            SigningCredentials = credentials,
            Issuer = "h2-projekt-gruppe-7-0",
            Audience = "h2-projekt-gruppe-7-0",
            // Issuer = configuration["Jwt:Issuer"],
            // Audience = configuration["Jwt:Audience"],
        };
        // Here we could use the JwtSecurityTokenHandler to create the JWT token, however the below is the recommended approach, and is also up to 30% faster.
        var tokenHandler = new JsonWebTokenHandler();

        string token = tokenHandler.CreateToken(tokenDescriptor);

        return token;
        // return Ok(new { message = "User logged in successfully", token });
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