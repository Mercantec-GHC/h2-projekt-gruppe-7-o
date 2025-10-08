using API.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StatusController : ControllerBase
    {
        private readonly AppDBContext _context;

        public StatusController(AppDBContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Tjekker om API'en kører korrekt.
        /// </summary>
        /// <returns>Status og besked om API'ens tilstand.</returns>
        /// <response code="200">API'en er kørende.</response>
        [HttpGet("healthcheck")]
        public IActionResult HealthCheck()
        {
            return Ok(new { status = "OK", message = "API'en er kørende!" });
        }

        /// <summary>
        /// Tjekker om databasen er tilgængelig (dummy indtil EFCore er sat op).
        /// </summary>
        /// <returns>Status og besked om databaseforbindelse.</returns>
        /// <response code="200">Database er kørende eller fejlbesked gives.</response>
        [HttpGet("dbhealthcheck")]
        public async Task<IActionResult> DBHealthCheck()
        {
            try
            {
                // Forsøg at åbne en connection til databasen
                var canConnect = await _context.Database.CanConnectAsync();

                if (!canConnect)
                {
                    return StatusCode(503, new { status = "Error", message = "Database is unavailable" });
                }

                // Optional: tjek at vi kan hente fx 1 række fra Bookings
                var bookingsExist = await _context.Bookings.AnyAsync();

                return Ok(new
                {
                    status = "OK",
                    message = "Database is running",
                    bookingsCount = bookingsExist ? 1 : 0
                });
            }
            catch (Exception ex)
            {
                // Returner 500 med fejlbesked
                return StatusCode(500, new { status = "Error", message = ex.Message });
            }
        }

        /// <summary>
        /// Simpelt ping-endpoint til at teste API'en.
        /// </summary>
        /// <returns>Status og "Pong" besked.</returns>
        /// <response code="200">API'en svarede med Pong.</response>
        [HttpGet("ping")]
        public IActionResult Ping()
        {
            return Ok(new { status = "OK", message = "Pong 🏓" });
        }
    }
}