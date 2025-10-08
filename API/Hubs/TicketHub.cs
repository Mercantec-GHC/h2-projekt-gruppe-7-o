using Microsoft.AspNetCore.SignalR;
using API.Data;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using API.Features.Chat;
using API.Models.Entities;

namespace API.Hubs
{
    public class TicketHub : Hub
    {
        private readonly AppDBContext _context;
        private static readonly Dictionary<string, TicketConnectionInfo> _connections = new();

        public TicketHub(AppDBContext context)
        {
            _context = context;
        }

        public override async Task OnConnectedAsync()
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userRole = Context.User?.FindFirst(ClaimTypes.Role)?.Value;

            if (!string.IsNullOrEmpty(userId))
            {
                _connections[Context.ConnectionId] = new TicketConnectionInfo
                {
                    ConnectionId = Context.ConnectionId,
                    UserId = userId,
                    UserRole = userRole ?? RoleNames.Customer,
                    ConnectedAt = DateTime.UtcNow
                };

                await Clients.Caller.SendAsync("Connected", "You are now connected to the TicketHub");
            }

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            if (_connections.TryGetValue(Context.ConnectionId, out var connectionInfo))
            {
                // Leave all ticket groups this user was part of
                foreach (var ticketId in connectionInfo.JoinedTickets)
                {
                    await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"ticket-{ticketId}");
                }

                _connections.Remove(Context.ConnectionId);
            }

            await base.OnDisconnectedAsync(exception);
        }

        // Join a specific ticket room
        public async Task JoinTicketRoom(int ticketId)
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userRole = Context.User?.FindFirst(ClaimTypes.Role)?.Value;

            if (string.IsNullOrEmpty(userId))
            {
                await Clients.Caller.SendAsync("Error", "User not authenticated");
                return;
            }

            // Check if user has access to this ticket
            var hasAccess = await HasTicketAccess(ticketId, userId, userRole);
            if (!hasAccess)
            {
                await Clients.Caller.SendAsync("Error", "Access denied to this ticket");
                return;
            }

            var groupName = $"ticket-{ticketId}";
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);

            if (_connections.TryGetValue(Context.ConnectionId, out var connectionInfo))
            {
                connectionInfo.JoinedTickets.Add(ticketId);
            }

            await Clients.Caller.SendAsync("JoinedTicketRoom", ticketId);

            // Notify others in the ticket room
            var userName = await GetUserDisplayName(userId);
            await Clients.GroupExcept(groupName, Context.ConnectionId)
                .SendAsync("UserJoinedTicket", ticketId, userName, userId);
        }

        // Leave a specific ticket room
        public async Task LeaveTicketRoom(int ticketId)
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var groupName = $"ticket-{ticketId}";

            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);

            if (_connections.TryGetValue(Context.ConnectionId, out var connectionInfo))
            {
                connectionInfo.JoinedTickets.Remove(ticketId);
            }

            await Clients.Caller.SendAsync("LeftTicketRoom", ticketId);

            // Notify others in the ticket room
            if (!string.IsNullOrEmpty(userId))
            {
                var userName = await GetUserDisplayName(userId);
                await Clients.Group(groupName).SendAsync("UserLeftTicket", ticketId, userName, userId);
            }
        }

        // Send a message to a ticket
        public async Task SendMessageToTicket(int ticketId, string content, bool isInternal = false)
        {
            var userIdValue = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userRole = Context.User?.FindFirst(ClaimTypes.Role)?.Value;

            if (string.IsNullOrEmpty(userIdValue) || string.IsNullOrEmpty(content?.Trim()) ||
                !Guid.TryParse(userIdValue, out var userId))
            {
                await Clients.Caller.SendAsync("Error", "Invalid message or user not authenticated");
                return;
            }

            // Check if user has access to this ticket
            var hasAccess = await HasTicketAccess(ticketId, userIdValue, userRole);
            if (!hasAccess)
            {
                await Clients.Caller.SendAsync("Error", "Access denied to this ticket");
                return;
            }

            try
            {
                // Use the provided isInternal parameter, but customers can't send internal messages
                var finalIsInternal = userRole != RoleNames.Customer && isInternal;

                // Save message to database
                var message = new TicketMessage
                {
                    TicketId = ticketId,
                    UserId = userId,
                    Content = content.Trim(),
                    IsInternal = finalIsInternal,
                    CreatedAt = DateTimeOffset.UtcNow,
                    UpdatedAt = DateTimeOffset.UtcNow
                };

                _context.TicketMessages.Add(message);
                await _context.SaveChangesAsync();

                // Get user details for the message
                var user = await _context.Users
                    .AsNoTracking()
                    .Where(u => u.Id == userId)
                    .Select(u => new { u.Id, u.FirstName, u.LastName, u.Email })
                    .FirstOrDefaultAsync();


                // Send to all clients in the ticket room
                var groupName = $"ticket-{ticketId}";
                var signalRMessage = new
                {
                    id = message.Id,
                    ticketId = message.TicketId,
                    userId = message.UserId.ToString(),
                    user = new
                    {
                        id = user?.Id.ToString() ?? message.UserId.ToString(),
                        firstName = user?.FirstName ?? "Unknown",
                        lastName = user?.LastName ?? "User",
                        email = user?.Email ?? ""
                    },
                    content = message.Content,
                    isInternal = message.IsInternal,
                    createdAt = message.CreatedAt,
                    updatedAt = message.UpdatedAt
                };

                await Clients.Group(groupName).SendAsync("NewTicketMessage", signalRMessage);

                // Update ticket's UpdatedAt timestamp and status based on sender
                var ticket = await _context.Tickets.FindAsync(ticketId);
                if (ticket != null)
                {
                    ticket.UpdatedAt = DateTimeOffset.UtcNow;

                    // Auto-update status based on who sent the message
                    // Only update if ticket is not already closed (5) or resolved (6)
                    if (ticket.StatusId != 5 && ticket.StatusId != 6)
                    {
                        var oldStatusId = ticket.StatusId;
                        ticket.StatusId =
                            userRole == RoleNames.Customer ? 4 : 3; // 4 = Waiting for Admin, 3 = Waiting for Customer

                        // If status changed, notify clients
                        if (oldStatusId != ticket.StatusId)
                        {
                            await _context.SaveChangesAsync();

                            // Get status name
                            var statusName = ticket.StatusId == 3 ? "Waiting for Customer" : "Waiting for Admin";
                            var changedByName = await GetUserDisplayName(userIdValue);

                            // Notify all clients in the ticket room about status change
                            await Clients.Group(groupName)
                                .SendAsync("TicketStatusChanged", ticketId, statusName, changedByName);
                        }
                        else
                        {
                            await _context.SaveChangesAsync();
                        }
                    }
                    else
                    {
                        await _context.SaveChangesAsync();
                    }

                    // Notify about ticket update
                    await NotifyTicketUpdated(ticketId);
                }
            }
            catch (Exception)
            {
                await Clients.Caller.SendAsync("Error", "Failed to send message");
            }
        }


        // public async Task NotifyStatusChange(int id, string newStatus, string changedBy = "System")
        // {
        //     // Notify all clients globally
        //     await Clients.All.SendAsync("TicketStatusChanged", id, newStatus, changedBy);
        //
        //     // Also notify clients in the specific ticket room
        //     var groupName = $"ticket-{id}";
        //     await Clients.Group(groupName).SendAsync("TicketStatusChanged", id, newStatus, changedBy);
        // }


        public async Task NotifyTicketUpdated(int ticketId)
        {
            await Clients.All.SendAsync("TicketUpdated", ticketId, DateTime.UtcNow);
        }

        // Helper methods
        private async Task<bool> HasTicketAccess(int ticketId, string? userId, string? userRole)
        {
            if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
                return false;

            var ticket = await _context.Tickets
                .AsNoTracking()
                .FirstOrDefaultAsync(t => t.Id == ticketId);

            if (ticket == null)
                return false;

            // Customers can only access their own tickets
            if (userRole == RoleNames.Customer)
            {
                return ticket.CreatedByUserId == userGuid;
            }

            // Admin, Receptionist, etc. can access all tickets
            return userRole == RoleNames.Admin || userRole == RoleNames.Receptionist || userRole == RoleNames.Cleaner;
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

                if (user != null)
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

    public class TicketConnectionInfo
    {
        public string ConnectionId { get; set; } = "";
        public string UserId { get; set; } = "";
        public string UserRole { get; set; } = "";
        public DateTime ConnectedAt { get; set; }
        public HashSet<int> JoinedTickets { get; set; } = new();
    }
}
