namespace API.Services.Password;

public interface IPasswordHashingService
{
    // Hash a password; output should include algorithm parameters and salt
    string Hash(string password);

    // Verify a plaintext password against a stored hash
    bool Verify(string password, string storedHash);
}