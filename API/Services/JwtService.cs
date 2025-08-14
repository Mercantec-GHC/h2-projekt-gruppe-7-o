using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Text;
using API.Models.Entities;
using Microsoft.IdentityModel.JsonWebTokens;
using JwtRegisteredClaimNames = System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames;

namespace API.Services
{
    /// <summary>
    /// Service til håndtering af JWT tokens - generering, validering og decoding
    /// </summary>
    public class JwtService
    {
        private readonly IConfiguration _configuration;
        private readonly string _secretKey;
        private readonly string _issuer;
        private readonly string _audience;
        private readonly int _expiryInMinutes;

        public JwtService(IConfiguration configuration)
        {
            _configuration = configuration;
            _secretKey = _configuration["Jwt:SecretKey"]
                         ?? Environment.GetEnvironmentVariable("JWT_SECRET_KEY")
                         ?? "MyVerySecureSecretKeyThatIsAtLeast32CharactersLong123456789";

            _issuer = _configuration["Jwt:Issuer"]
                      ?? Environment.GetEnvironmentVariable("JWT_ISSUER")
                      ?? "H2-2025-API";

            _audience = _configuration["Jwt:Audience"]
                        ?? Environment.GetEnvironmentVariable("JWT_AUDIENCE")
                        ?? "H2-2025-Client";

            _expiryInMinutes = int.Parse(_configuration["Jwt:ExpirationInMinutes"]
                                         ?? Environment.GetEnvironmentVariable("JWT_EXPIRATION_IN_MINUTES")
                                         ?? "60");
        }

        /// <summary>
        /// Genererer en JWT token for en bruger
        /// </summary>
        /// <param name="user">Brugeren der skal have en token</param>
        /// <returns>JWT token som string</returns>
        public string GenerateToken(User user)
        {
            var securityKey = Encoding.ASCII.GetBytes(_secretKey);
            var signingCredentials = new SigningCredentials(
                new SymmetricSecurityKey(securityKey),
                SecurityAlgorithms.HmacSha256Signature);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity([
                    new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                    new Claim(JwtRegisteredClaimNames.Email, user.Email),
                    //TODO: add more claims, like email_verified
                    // new Claim("email_verified", user.EmailVerified.ToString()),
                    new Claim(ClaimTypes.Role, user.Role.Name)
                ]),
                Expires = DateTime.UtcNow.AddMinutes(_expiryInMinutes),
                SigningCredentials = signingCredentials,
                Issuer = _issuer,
                Audience = _audience
            };
            // Here we could use the JwtSecurityTokenHandler to create the JWT token, however the below is the recommended approach, and is also up to 30% faster.
            var tokenHandler = new JsonWebTokenHandler();

            string token = tokenHandler.CreateToken(tokenDescriptor);

            return token;
        }
    }
}