using API.Models.Entities;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
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
        public readonly int _expiryInMinutes;

        public JwtService(IConfiguration configuration)
        {
            _configuration = configuration;
            _secretKey = _configuration["Jwt:SecretKey"];



            _issuer = _configuration["Jwt:Issuer"];


            _audience = _configuration["Jwt:Audience"];


            _expiryInMinutes = int.Parse(_configuration["Jwt:ExpirationInMinutes"]);
                                       
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
                SecurityAlgorithms.HmacSha256);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity([
                    // TODO: couldn't get getting the id to work with the JwtRegisteredClaimNames.Sub
                    new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(JwtRegisteredClaimNames.Email, user.Email),
                    new Claim("firstName", user.FirstName),
                    new Claim("lastName", user.LastName),
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

        /// <summary>
        /// Genererer en JWT token for en AD bruger
        /// </summary>
        /// <param name="adUser">AD brugeren der skal have en token</param>
        /// <param name="role">Rollen der skal tildeles brugeren</param>
        /// <returns>JWT token som string</returns>
        public string GenerateTokenForADUser(ADUserInfo adUser, string role)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_secretKey);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, adUser.SamAccountName),
                new Claim(ClaimTypes.Email, adUser.Email),
                new Claim(ClaimTypes.Name, adUser.DisplayName),
                new Claim("userId", adUser.SamAccountName),
                new Claim("username", adUser.SamAccountName),
                new Claim("adUser", "true"), // Marker som AD bruger
                new Claim("adGroups", string.Join(",", adUser.Groups))
            };

            // Tilføj rolle claim
            claims.Add(new Claim(ClaimTypes.Role, role));

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddMinutes(_expiryInMinutes),
                Issuer = _issuer,
                Audience = _audience,
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        
    

        public string? GetTokenFromRequest(HttpRequest request)
        {
            var authHeader = request.Headers["Authorization"].ToString();
            var token = authHeader?.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase) == true
                ? authHeader.Substring("Bearer ".Length).Trim()
                : null;
            return token;
        }
    }
}