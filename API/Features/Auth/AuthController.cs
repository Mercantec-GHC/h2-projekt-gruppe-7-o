using API.Data;
using API.Models.Entities;
using API.Repositories;
using API.Services;
using API.Services.Password;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Models.Dtos;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly AppDBContext _context;
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHashingService _passwordHashingService;

    public AuthController(AppDBContext context, IUserRepository userRepository,
        IPasswordHashingService passwordHashingService)
    {
        _context = context;
        _passwordHashingService = passwordHashingService;
        _userRepository = userRepository;
    }

    /// <summary>
    /// Registers a new user
    /// </summary>
    /// <param name="registerDto">The user registration information</param>
    /// <returns>A success message and the registered email</returns>
    /// <response code="200">If the user was registered successfully</response>
    /// <response code="400">If the email is already registered</response>
    [HttpPost("register")]
    public async Task<ActionResult<RegisterResponseDto>> RegisterUser([FromBody] RegisterDto registerDto)
    {
        if (await _userRepository.FindUserByEmail(registerDto.Email) != null)
        {
            return BadRequest("A user with that email already exists");
        }

        string hashedPassword = _passwordHashingService.Hash(registerDto.Password);

        //TODO: use repository?
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

        await _userRepository.AddAsync(user);

        return new RegisterResponseDto
        {
            Message = "User registered successfully",
            Email = user.Email,
            Id = user.Id
        };
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
    public async Task<ActionResult<string>> LoginUser([FromBody] LoginDto loginDto, JwtService jwtService)
    {
        var user = await _userRepository.FindUserByEmail(loginDto.Email);
        if (user == null) return Unauthorized("Incorrect email or password");

        bool isPasswordCorrect = _passwordHashingService.Verify(loginDto.Password, user.HashedPassword);

        if (!isPasswordCorrect) return Unauthorized("Incorrect email or password");

        user.LastLogin = DateTimeOffset.UtcNow;

        //TODO: move this to repository>?
        _context.Users.Update(user);
        await _context.SaveChangesAsync();

        var token = jwtService.GenerateToken(user);
        //TODO: maybe we want to return more than just the token 
        return Ok(token);
    }
}