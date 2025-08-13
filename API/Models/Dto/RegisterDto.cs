namespace API.Models.Dto
{
    public class RegisterDto
    {
        public required string FirstName { get; set; }
        public required string LastName { get; set; } 
        public required string Email { get; set; }
        public string? Phone { get; set; } // Optional, can be null
       
        public required string Password { get; set; } // This should be hashed before saving
       


    }
}
