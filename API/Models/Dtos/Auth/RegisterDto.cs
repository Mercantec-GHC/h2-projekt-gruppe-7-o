using System.ComponentModel.DataAnnotations;

namespace API.Models.Dtos;

public class RegisterDto
{
    [EmailAddress(ErrorMessage = "Invalid email address")]
    [Required(ErrorMessage = "Email is required")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Password is required")]
    [StringLength(100, MinimumLength = 8, ErrorMessage = "Password must be at least 8 characters long")]
    // TODO: uncomment after testing:
    // [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$",
    //     ErrorMessage =
    //         "The password must contain at least one uppercase letter, one lowercase letter, one number and one special character")]
    [DataType(DataType.Password)]
    public string Password { get; set; } = string.Empty;

    [Required(ErrorMessage = "Confirm password is required")]
    [DataType(DataType.Password)]
    [Compare(nameof(Password), ErrorMessage = "Passwords must match.")]
    public string ConfirmPassword { get; set; } = string.Empty;

    [Required(ErrorMessage = "First name is required")]
    public string FirstName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Last name is required")]
    public string LastName { get; set; } = string.Empty;
}