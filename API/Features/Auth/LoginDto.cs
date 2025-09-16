using System.ComponentModel.DataAnnotations;

namespace API.Models.Dtos;

public class LoginDto
{
    [Required(ErrorMessage = "Username or email is required")]
    public required string UsernameOrEmail { get; set; }

    // For AD login, password can be optional 
    public string? Password { get; set; }
}