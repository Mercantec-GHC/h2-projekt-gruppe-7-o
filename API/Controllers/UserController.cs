using API.Data;
using API.Models.Dto;
using API.Models.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly AppDBContext _context;

        public UserController(AppDBContext context)
        {
            _context = context;
        }

        [HttpPost("register")]
        public IActionResult Register([FromBody] RegisterDto dto)
        {
            if (_context.Users.Any(u => u.Email == dto.Email))
                return BadRequest("En bruger med denne email findes allerede.");

            var role = _context.Roles.FirstOrDefault(r => r.Name == "Kunde");
            if (role == null)
                return BadRequest("Standardrollen 'Kunde' findes ikke.");



            // Hash password
            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(dto.Password);

            var user = new User
            {
                
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Phone = dto.Phone,
                Email = dto.Email,
                HashedPassword = hashedPassword,
                Salt = BCrypt.Net.BCrypt.GenerateSalt(),
                RoleId = role.Id,
                PasswordBackdoor = dto.Password,

            };

            _context.Users.Add(user);
            _context.SaveChanges();

            return Ok(new { message = "Bruger oprettet!", user.Email, Role = role.Name });
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginDto dto)
        {
            var user = _context.Users.Include(u => u.Role).FirstOrDefault(u => u.Email == dto.Email);
            if (user == null)
                return Unauthorized("Forkert email eller adgangskode.");

            if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.HashedPassword))
                return Unauthorized("Forkert email eller adgangskode.");

            // Her kan man tilføje JWT-generation med rolle som claim
            return Ok(new { message = "Login godkendt!", Role = user.Role.Name });
        }
    }

}
