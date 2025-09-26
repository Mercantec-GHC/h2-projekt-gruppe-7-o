using Microsoft.AspNetCore.SignalR;

namespace API.Hubs
{
    public class TicketHub : Hub
    {
        public override async Task OnConnectedAsync()
        {
            await Clients.Caller.SendAsync("Connected", "You are now connected to the TicketHub");
            await base.OnConnectedAsync();
        }

        // Notify all clients when a new ticket is created
        public async Task NotifyNewTicket(int id, string title, string status)
        {
            await Clients.All.SendAsync("NewTicket", id, title, status, DateTime.Now);
        }

        // Notify all clients when a ticket status changes
        public async Task NotifyStatusChange(int id, string newStatus)
        {
            await Clients.All.SendAsync("TicketStatusChanged", id, newStatus);
        }

        // Notify all clients when a ticket is assigned
        public async Task NotifyTicketAssigned(int id, string assignedUser)
        {
            await Clients.All.SendAsync("TicketAssigned", id, assignedUser);
        }
    }
}
