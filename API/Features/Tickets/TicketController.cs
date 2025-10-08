using API.Data;
using API.Hubs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using API.Features.Chat;
using API.Mapping;
using API.Models.Entities;


[ApiController]
[Route("api/[controller]")]
public class TicketsController : ControllerBase
{
    private readonly AppDBContext _context;
    private readonly IHubContext<TicketHub> _hubContext;

    public TicketsController(AppDBContext context, IHubContext<TicketHub> hubContext)
    {
        _context = context;
        _hubContext = hubContext;
    }

    [HttpGet]
    public async Task<AllTicketsResponseDto> GetTickets(
        [FromQuery] string? status = null,
        [FromQuery] string? assignedTo = null,
        [FromQuery] bool? myTicketsOnly = null,
        [FromQuery] string sortBy = "createdAt",
        [FromQuery] string sortOrder = "desc",
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var currentUserRole = User.FindFirst(ClaimTypes.Role)?.Value;

        var query = _context.Tickets
            .Include(t => t.Status).AsQueryable();

        // Filter by status
        if (!string.IsNullOrEmpty(status))
        {
            query = query.Where(t => t.Status.Name == status);
        }

        // Filter by assignment
        if (!string.IsNullOrEmpty(assignedTo) && Guid.TryParse(assignedTo, out var assignedToGuid))
        {
            query = query.Where(t => t.AssignedToUserId == assignedToGuid);
        }

        // Filter for my tickets only (admin/staff view)
        if (myTicketsOnly == true && !string.IsNullOrEmpty(currentUserId) &&
            Guid.TryParse(currentUserId, out var currentUserGuid))
        {
            query = query.Where(t => t.AssignedToUserId == currentUserGuid);
        }

        // For customers, only show their own tickets
        if (currentUserRole == RoleNames.Customer && !string.IsNullOrEmpty(currentUserId) &&
            Guid.TryParse(currentUserId, out var createdByUserGuid))
        {
            query = query.Where(t => t.CreatedByUserId == createdByUserGuid);
        }

        // Apply sorting
        query = sortBy.ToLower() switch
        {
            "createdat" => sortOrder.ToLower() == "asc"
                ? query.OrderBy(t => t.CreatedAt)
                : query.OrderByDescending(t => t.CreatedAt),
            "updatedat" => sortOrder.ToLower() == "asc"
                ? query.OrderBy(t => t.UpdatedAt)
                : query.OrderByDescending(t => t.UpdatedAt),
            "title" => sortOrder.ToLower() == "asc"
                ? query.OrderBy(t => t.Title)
                : query.OrderByDescending(t => t.Title),
            _ => query.OrderByDescending(t => t.CreatedAt)
        };


        var totalCount = await query.CountAsync();
        var tickets = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(t => new TicketDto
            {
                Id = t.Id,
                Title = t.Title,
                Description = t.Description,
                Status = t.Status.Name,
                // TODO: I can't get the ToUserDto() mapping method to work here, even though we have a user...
                AssignedToUser = t.AssignedToUser,
                CreatedByUser = t.CreatedByUser,
                CreatedAt = t.CreatedAt.DateTime.ToUniversalTime(),
                UpdatedAt = t.UpdatedAt.DateTime.ToUniversalTime()
            })
            .ToListAsync();

        return new AllTicketsResponseDto
        {
            Tickets = tickets,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling((double)totalCount / pageSize)
        };
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetTicket(int id)
    {
        var userIdValue = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrWhiteSpace(userIdValue) || !Guid.TryParse(userIdValue, out var currentUserId))
        {
            return Unauthorized();
        }

        var currentUserRole = User.FindFirst(ClaimTypes.Role)?.Value;

        var ticket = await _context.Tickets
            .Include(t => t.Status)
            .Include(t => t.AssignedToUser)
            .Include(t => t.CreatedByUser)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (ticket == null)
        {
            return NotFound();
        }

        if (currentUserRole == RoleNames.Customer && ticket?.CreatedByUser?.Id != currentUserId)
        {
            return Forbid();
        }


        var ticketDto = new TicketDto
        {
            Id = ticket.Id,
            Title = ticket.Title,
            Description = ticket.Description,
            Status = ticket.Status.Name,
            // TODO: I can't get the ToUserDto() mapping method to work here, even though we have a user...
            AssignedToUser = ticket.AssignedToUser,
            CreatedByUser = ticket.CreatedByUser,
            CreatedAt = ticket.CreatedAt.DateTime.ToUniversalTime(),
            UpdatedAt = ticket.UpdatedAt.DateTime.ToUniversalTime()
        };
        return Ok(ticketDto);
    }

    [HttpGet("statuses")]
    public async Task<IActionResult> GetStatuses()
    {
        var statuses = await _context.TicketStatuses
            .Select(s => s.Name)
            .ToListAsync();

        return Ok(statuses);
    }

    [HttpPost]
    public async Task<IActionResult> CreateTicket([FromBody] CreateTicketDto dto)
    {
        var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        // slå status op
        var statusEntity = await _context.TicketStatuses
            .FirstOrDefaultAsync(s => s.Name == dto.StatusName);

        // TODO: not sure if we should just force a status here instead? This might be too strict..
        if (statusEntity == null)
        {
            return BadRequest($"Status '{dto.StatusName}' does not exist.");
        }

        var ticket = new Ticket
        {
            Title = dto.Title,
            Description = dto.Description,
            CreatedAt = DateTimeOffset.UtcNow,
            Status = statusEntity,
            StatusId = statusEntity.Id,
            CreatedByUserId = Guid.TryParse(currentUserId, out var createdByGuid) ? createdByGuid : null,
            AssignedToUserId = dto.AssignedToUserId
        };

        _context.Tickets.Add(ticket);
        await _context.SaveChangesAsync();

        await _hubContext.Clients.All.SendAsync(
            "NewTicket",
            ticket.Id,
            ticket.Title,
            ticket.Status.Name
        );

        return Ok(new TicketDto
        {
            Id = ticket.Id
        });
    }


    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateTicketStatusDto dto)
    {
        var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        var ticket = await _context.Tickets
            .Include(t => t.Status)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (ticket == null)
            return NotFound();

        var statusEntity = await _context.TicketStatuses
            .FirstOrDefaultAsync(s => s.Name == dto.StatusName);

        if (statusEntity == null)
            return BadRequest($"Status '{dto.StatusName}' does not exist.");

        ticket.Status = statusEntity;
        ticket.StatusId = statusEntity.Id;
        ticket.UpdatedAt = DateTimeOffset.UtcNow;

        await _context.SaveChangesAsync();

        // Get user display name for the changed by field
        var changedByName = "System";
        if (!string.IsNullOrEmpty(currentUserId) && Guid.TryParse(currentUserId, out var userGuid))
        {
            var user = await _context.Users
                .AsNoTracking()
                .Where(u => u.Id == userGuid)
                .Select(u => new { u.FirstName, u.LastName, u.Email })
                .FirstOrDefaultAsync();

            if (user != null && !string.IsNullOrEmpty(user.FirstName))
            {
                changedByName = $"{user.FirstName} {user.LastName}".Trim();
            }
            else if (user != null)
            {
                changedByName = user.Email ?? "Admin";
            }
        }

        // Notify all clients about status change
        await _hubContext.Clients.All.SendAsync(
            "TicketStatusChanged",
            ticket.Id,
            ticket.Status.Name,
            changedByName
        );

        // If ticket is being closed or resolved, add system message
        // TODO: this should be typed properly...
        if (dto.StatusName == "Resolved" || dto.StatusName == "Closed")
        {
            var systemMessage = new TicketMessage
            {
                TicketId = ticket.Id,
                Content = $"Sagen er blevet {dto.StatusName.ToLower()} af {changedByName}",
                IsInternal = false,
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow
            };

            _context.TicketMessages.Add(systemMessage);
            await _context.SaveChangesAsync();

            // Send system message via SignalR
            var groupName = $"ticket-{ticket.Id}";
            await _hubContext.Clients.Group(groupName).SendAsync("NewTicketMessage", new
            {
                id = systemMessage.Id,
                ticketId = systemMessage.TicketId,
                userId = systemMessage.UserId.ToString(),
                user = new
                {
                    id = "system",
                    firstName = "System",
                    lastName = "",
                    email = ""
                },
                content = systemMessage.Content,
                isInternal = systemMessage.IsInternal,
                createdAt = systemMessage.CreatedAt,
                updatedAt = systemMessage.UpdatedAt
            });
        }

        return Ok(ticket.Status.Name);
    }

    [HttpPut("{id}/assign")]
    public async Task<IActionResult> AssignTicket(int id, [FromBody] AssignTicketDto dto)
    {
        var ticket = await _context.Tickets
            .Include(t => t.Status)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (ticket == null)
            return NotFound();

        ticket.AssignedToUserId = dto.AssignedToUserId;
        ticket.UpdatedAt = DateTimeOffset.UtcNow;

        await _context.SaveChangesAsync();

        // Re-query the ticket to get the updated AssignedToUser data
        var updatedTicket = await _context.Tickets
            .Include(t => t.Status)
            .Include(t => t.AssignedToUser)
            .Include(t => t.CreatedByUser)
            .FirstOrDefaultAsync(t => t.Id == id);

        await _hubContext.Clients.All.SendAsync(
            "TicketAssigned",
            updatedTicket.Id,
            dto.AssignedToUserId
        );

        var ticketDto = new TicketDto
        {
            Id = updatedTicket.Id,
            Title = updatedTicket.Title,
            Description = updatedTicket.Description,
            Status = updatedTicket.Status.Name,
            AssignedToUser = updatedTicket.AssignedToUser,
            CreatedByUser = updatedTicket.CreatedByUser,
            CreatedAt = updatedTicket.CreatedAt.DateTime.ToUniversalTime(),
            UpdatedAt = updatedTicket.UpdatedAt.DateTime.ToUniversalTime()
        };

        return Ok(ticketDto);
    }
}