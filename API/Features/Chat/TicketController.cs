using API.Data;
using API.Hubs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Security.Claims;
using System.Threading.Tasks;


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

    [HttpPost]
    public async Task<IActionResult> CreateTicket([FromBody] CreateTicketDto dto)
    {
        // slå status op
        var statusEntity = await _context.TicketStatuses
            .FirstOrDefaultAsync(s => s.Name == dto.StatusName);

        if (statusEntity == null)
            return BadRequest($"Status '{dto.StatusName}' does not exist.");

        var ticket = new Ticket
        {
            Title = dto.Title,
            Description = dto.Description,
            CreatedAt = DateTime.UtcNow,
            Status = statusEntity,
            StatusId = statusEntity.Id
        };

        _context.Tickets.Add(ticket);
        await _context.SaveChangesAsync();

        await _hubContext.Clients.All.SendAsync(
            "NewTicket",
            ticket.Id,
            ticket.Title,
            ticket.Status.Name
        );

        return Ok(ticket);
    }



    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateTicketStatusDto dto)
    {
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

        await _context.SaveChangesAsync();

        await _hubContext.Clients.All.SendAsync(
            "TicketStatusChanged",
            ticket.Id,
            ticket.Status.Name
        );

        return Ok(ticket);
    }


}
public class CreateTicketDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string StatusName { get; set; } = "Open"; // default
}

public class UpdateTicketStatusDto
{
    public string StatusName { get; set; } = string.Empty;
}