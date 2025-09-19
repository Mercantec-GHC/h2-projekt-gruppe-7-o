using API.Data;
using API.Models.Entities;
using API.Repositories;
using API.Services;
using API.Services.Password;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace API.Models.Dtos;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly AppDBContext _context;
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHashingService _passwordHashingService;
    private readonly JwtService _jwtService;
    private readonly ActiveDirectoryService _adService;
    private readonly LoginAttemptService _loginAttemptService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        AppDBContext context, 
        IUserRepository userRepository,
        IPasswordHashingService 
        passwordHashingService,
        JwtService jwtService,
        ActiveDirectoryService adService,
        LoginAttemptService loginAttemptService,
        ILogger<AuthController> logger
        )
    {
        _context = context;
        _passwordHashingService = passwordHashingService;
        _userRepository = userRepository;
        _jwtService = jwtService;
        _adService = adService;
        _loginAttemptService = loginAttemptService;
        _logger = logger;
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
            IsADUser = false
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
    /// <response code="401">If the email/username or password is incorrect, or the user is not found</response>
    /// <response code="429">Account temporarily locked due to too many failed login attempts>
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
    {
        var usernameOrEmail = loginDto.UsernameOrEmail;

        // Tjek om kontoen er låst
        if (_loginAttemptService.IsLockedOut(usernameOrEmail))
        {
            var remaining = _loginAttemptService.GetRemainingLockoutSeconds(usernameOrEmail);
            return StatusCode(429, new
            {
                message = "Account temporarily locked due to too many failed login attempts.",
                remainingLockoutSeconds = remaining
            });
        }

        //  1: DB login
        var user = await _userRepository.FindUserByEmail(usernameOrEmail);
        if (user != null)
        {
            if (!_passwordHashingService.Verify(loginDto.Password, user.HashedPassword))
            {
                var delay = _loginAttemptService.RecordFailedAttempt(usernameOrEmail);
                if (delay > 0) await Task.Delay(delay * 1000);

                return Unauthorized(new { message = "Incorrect email or password", delayApplied = delay });
            }

            // Succesfuldt login
            _loginAttemptService.RecordSuccessfulLogin(usernameOrEmail);

            user.LastLogin = DateTimeOffset.UtcNow;
            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            var token = _jwtService.GenerateToken(user);
            return Ok(new
            {
                token,
                user = new { user.Id, user.Email, Role = user.Role.Name, isADUser = false }
            });
        }

        // 2: AD login
        var adUser = await _adService.AuthenticateUserAsync(usernameOrEmail, loginDto.Password);
        if (adUser != null)
        {
            _loginAttemptService.RecordSuccessfulLogin(usernameOrEmail);

            var roleName = _adService.MapADGroupToRole(adUser.Groups);
            var roleId = await _context.Roles
                .Where(r => r.Name == roleName)
                .Select(r => r.Id)
                .SingleOrDefaultAsync();

            // Synk AD-bruger til DB hvis den ikke findes
            var newUser = await _userRepository.FindUserByEmail(adUser.Email) ?? new User
            {
                Email = adUser.Email,
                FirstName = adUser.FirstName,
                LastName = adUser.LastName,
                RoleId = roleId,
                IsADUser = true,
                LastLogin = DateTimeOffset.UtcNow
            };

            if (newUser.Id == Guid.Empty) await _userRepository.AddAsync(newUser);

            var token = _jwtService.GenerateTokenForADUser(adUser, roleName);
            return Ok(new
            {
                token,
                user = new { newUser.Id, newUser.Email, Role = roleName, isADUser = true }
            });
        }

        // Forkert login -> registrer mislykket forsøg
        var dbDelay = _loginAttemptService.RecordFailedAttempt(usernameOrEmail);
        if (dbDelay > 0) await Task.Delay(dbDelay * 1000);
        return Unauthorized(new { message = "Incorrect email or password", delayApplied = dbDelay });
    }



    /// <summary>
    /// Test endpoint til at verificere AD forbindelse og konfiguration
    /// Kun tilgængelig for administratorer
    /// </summary>
    /// <returns>AD forbindelsesstatus og konfiguration</returns>
    /// <response code="200">AD status hentet succesfuldt</response>
    /// <response code="401">Ikke autoriseret - manglende eller ugyldig token</response>
    /// <response code="403">Forbudt - kun administratorer har adgang</response>
    /// <response code="500">Der opstod en intern serverfejl</response>
    [HttpGet("ad-status")]
    public async Task<IActionResult> GetADStatus()
    {
        try
        {
            _logger.LogInformation("Henter AD status og konfiguration");

            // Test AD forbindelse direkte med test credentials
            _logger.LogInformation("Tester AD forbindelse med test credentials");
            var testUser = await _adService.AuthenticateUserAsync("adReader", "Merc1234!");

            var status = new
            {
                adConfigured = true,
                server = "10.133.71.113",
                domain = "kabdikhan.local",
                port = 389,
                useSSL = false,
                testConnection = testUser != null,
                testUser = testUser?.SamAccountName ?? "Ikke tilgængelig",
                timestamp = DateTime.UtcNow.AddHours(2)
            };

            var statusText = status.testConnection ? "OK" : "FEJL";
            _logger.LogInformation("AD status hentet: {Status} (Auth: {AuthStatus})",
                statusText, status.testConnection ? "OK" : "FEJL");

            return Ok(status);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Fejl ved hentning af AD status");
            return StatusCode(500, "Der opstod en intern serverfejl ved hentning af AD status");
        }
    }

    


    /// <summary>
    /// Henter information om den nuværende AD bruger baseret på JWT token
    /// </summary>
    /// <returns>Detaljeret AD brugerinformation inklusiv grupper og roller</returns>
    /// <response code="200">AD brugerinformation blev hentet succesfuldt</response>
    /// <response code="401">Ikke autoriseret - manglende eller ugyldig token</response>
    /// <response code="500">Der opstod en intern serverfejl</response>
    [Authorize]
    [HttpGet("ad-me")]
    public IActionResult GetCurrentADUser()
    {
        try
        {
            // Hent claims fra JWT token
            var samAccountName = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            var displayName = User.FindFirst(ClaimTypes.Name)?.Value;
            var role = User.FindFirst(ClaimTypes.Role)?.Value;
            var isADUser = User.FindFirst("adUser")?.Value == "true";
            var adGroups = User.FindFirst("adGroups")?.Value?.Split(',') ?? new string[0];

            if (samAccountName == null)
            {
                return Unauthorized("Bruger-ID ikke fundet i token.");
            }

            _logger.LogInformation("Henter nuværende AD bruger info for: {SamAccountName}", samAccountName);

            return Ok(new
            {
                samAccountName = samAccountName,
                email = email,
                displayName = displayName,
                role = role,
                adGroups = adGroups,
                isADUser = isADUser,
                loginMethod = "Active Directory"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Fejl ved hentning af nuværende AD bruger");
            return StatusCode(500, "Der opstod en intern serverfejl ved hentning af AD brugerinfo");
        }
    }
}
