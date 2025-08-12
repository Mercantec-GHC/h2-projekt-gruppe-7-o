using System.ComponentModel.DataAnnotations;

namespace API.Models.Dtos;

public class LoginDto
{
    //TODO: Do we need to validate it is an email address here already?
    [EmailAddress] public string Email { get; set; }

    public string Password { get; set; }
}