using System.ComponentModel.DataAnnotations;

namespace API.Models.Dtos;

public class LoginDto
{
    [EmailAddress(ErrorMessage = "Invalid email address"), Required(ErrorMessage = "Email is required")]
    public required string Email { get; set; }

    [Required(ErrorMessage = "Password is required")]
    public required string Password { get; set; }
}