using API.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using API.Mapping;

namespace API.Features.Chat
{
    [ApiController]
    [Route("api/tickets/{ticketId}/messages")]
    public class TicketMessagesController : ControllerBase
    {
        private readonly AppDBContext _context;

        public TicketMessagesController(AppDBContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<AllTicketMessagesResponseDto>> GetTicketMessages(
            int ticketId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 50)
        {
            var userIdValue = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var currentUserRole = User.FindFirst(ClaimTypes.Role)?.Value;

            if (string.IsNullOrWhiteSpace(userIdValue) || !Guid.TryParse(userIdValue, out var currentUserId))
            {
                return Unauthorized();
            }

            // Check if user has access to this ticket
            var hasAccess = await HasTicketAccess(ticketId, currentUserId, currentUserRole);
            if (!hasAccess)
            {
                return Forbid();
            }

            var query = _context.TicketMessages
                .Where(tm => tm.TicketId == ticketId)
                .OrderBy(tm => tm.CreatedAt);

            var totalCount = await query.CountAsync();
            var messages = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(tm => new TicketMessageResponseDto
                {
                    Id = tm.Id,
                    TicketId = tm.TicketId,
                    //TODO: I can't get the ToUserDto() mapping method to work here, even though we have a user...
                    User = tm.User,
                    Content = tm.Content,
                    IsInternal = tm.IsInternal,
                    CreatedAt = tm.CreatedAt.DateTime.ToUniversalTime(),
                    UpdatedAt = tm.UpdatedAt.DateTime.ToUniversalTime()
                })
                .ToListAsync();

            var responseDto = new AllTicketMessagesResponseDto
            {
                Messages = messages,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling((double)totalCount / pageSize)
            };

            return Ok(responseDto);
        }

        [HttpPost]
        public async Task<ActionResult<TicketMessageResponseDto>> CreateMessage(
            int ticketId,
            [FromBody] CreateTicketMessageDto dto)
        {
            var userIdValue = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var currentUserRole = User.FindFirst(ClaimTypes.Role)?.Value;

            if (string.IsNullOrWhiteSpace(userIdValue) || !Guid.TryParse(userIdValue, out var currentUserId))
            {
                return Unauthorized();
            }

            // Check if user has access to this ticket
            var hasAccess = await HasTicketAccess(ticketId, currentUserId, currentUserRole);
            if (!hasAccess)
            {
                return Forbid();
            }

            // Validate content
            if (string.IsNullOrWhiteSpace(dto.Content))
            {
                return BadRequest("Message content cannot be empty");
            }

            // Get user display name
            //TODO: Typesafety here, instead of just check a string?
            var isInternal = currentUserRole != "Customer" && dto.IsInternal;

            var message = new TicketMessage
            {
                TicketId = ticketId,
                UserId = currentUserId,
                Content = dto.Content.Trim(),
                IsInternal = isInternal,
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow
            };

            _context.TicketMessages.Add(message);

            // Update ticket's UpdatedAt timestamp
            var ticket = await _context.Tickets.FindAsync(ticketId);
            if (ticket != null)
            {
                ticket.UpdatedAt = DateTimeOffset.UtcNow;
                //TODO: we need typesafety here, instead of using these magic numbers...
                // Basically we are just setting the ticket status to "Waiting for Customer" or "Waiting for Admin"

                // If ticket is not already closed or resolved, update its status
                if (ticket.StatusId != 5 || ticket.StatusId != 6)
                {
                    ticket.StatusId = currentUserRole == "Customer" ? 4 : 3;
                }
            }

            await _context.SaveChangesAsync();

            var messageDto = new TicketMessageResponseDto
            {
                Id = message.Id,
                TicketId = message.TicketId,
                // TODO: I can't get the ToUserDto() mapping method to work here, even though we have a user...
                User = message.User,
                Content = message.Content,
                IsInternal = message.IsInternal,
                CreatedAt = message.CreatedAt.DateTime.ToUniversalTime(),
                UpdatedAt = message.UpdatedAt.DateTime.ToUniversalTime(),
            };

            return Ok(messageDto);
        }

        [HttpDelete("{messageId}")]
        public async Task<IActionResult> DeleteMessage(int ticketId, int messageId)
        {
            var userIdValue = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var currentUserRole = User.FindFirst(ClaimTypes.Role)?.Value;

            if (string.IsNullOrWhiteSpace(userIdValue) || !Guid.TryParse(userIdValue, out var currentUserId))
            {
                return Unauthorized();
            }

            var message = await _context.TicketMessages
                .Where(tm => tm.Id == messageId && tm.TicketId == ticketId)
                .FirstOrDefaultAsync();

            if (message == null)
            {
                return NotFound();
            }

            // Only allow users to delete their own messages or admins to delete any message
            if (message.UserId != currentUserId && currentUserRole != "Admin")
            {
                return Forbid();
            }

            // Soft delete by updating content
            message.Content = "[Message deleted]";
            message.UpdatedAt = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // Helper methods
        private async Task<bool> HasTicketAccess(int ticketId, Guid userId, string? userRole)
        {
            var ticket = await _context.Tickets
                .AsNoTracking()
                .FirstOrDefaultAsync(t => t.Id == ticketId);

            if (ticket == null)
                return false;

            // Customers can only access their own tickets
            if (userRole == "Customer")
            {
                return ticket.CreatedByUserId == userId;
            }

            // Admin, Receptionist, etc. can access all tickets
            return userRole == "Admin" || userRole == "Receptionist" || userRole == "Cleaner";
        }

        private async Task<string> GetUserDisplayName(string userId)
        {
            try
            {
                if (!Guid.TryParse(userId, out var userGuid))
                {
                    return "Unknown User";
                }

                var user = await _context.Users
                    .AsNoTracking()
                    .Where(u => u.Id == userGuid)
                    .Select(u => new { u.FirstName, u.LastName, u.Email })
                    .FirstOrDefaultAsync();

                if (user != null && !string.IsNullOrEmpty(user.FirstName))
                {
                    return $"{user.FirstName} {user.LastName}".Trim();
                }

                return user?.Email ?? "Unknown User";
            }
            catch
            {
                return "Unknown User";
            }
        }
    }
}