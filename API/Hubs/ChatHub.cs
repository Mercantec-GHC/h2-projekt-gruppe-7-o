using Microsoft.AspNetCore.SignalR;
using System.Text.RegularExpressions;

namespace API.Hubs;

/// <summary>
/// SignalR Hub for chat funktionalitet
/// Hub pattern giver os en centraliseret måde at håndtere real-time kommunikation på
/// </summary>
public class ChatHub : Hub
{
    private static readonly Dictionary<string, string> _userConnections = new();

    /// <summary>
    /// Når en klient forbinder til hub'en
    /// </summary>
    public override async Task OnConnectedAsync()
    {
        await base.OnConnectedAsync();
    }

    /// <summary>
    /// Når en klient afbryder forbindelsen til hub'en
    /// </summary>
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        if (_userConnections.TryGetValue(Context.ConnectionId, out var username))
        {
            _userConnections.Remove(Context.ConnectionId);

            // Fjern fra StatusHub
            StatusHub.RemoveChatConnection(Context.ConnectionId);

            await Clients.All.SendAsync("UserLeft", "System", $"{username} har forladt chatten");
        }
        await base.OnDisconnectedAsync(exception);
    }

    /// <summary>
    /// Registrer en bruger med deres forbindelse
    /// </summary>
    /// <param name="username">Brugerens navn</param>
    public async Task RegisterUser(string username)
    {
        _userConnections[Context.ConnectionId] = username;

        // Registrer i StatusHub
        StatusHub.RegisterChatConnection(Context.ConnectionId, username);

        await Clients.All.SendAsync("UserJoined", "System", $"{username} har tilsluttet sig chatten");
    }

    /// <summary>
    /// Send en besked til alle forbundne klienter
    /// </summary>
    /// <param name="user">Brugerens navn</param>
    /// <param name="message">Beskeden</param>
    public async Task SendMessage(string user, string message)
    {
        await Clients.All.SendAsync("ReceiveMessage", user, message, DateTime.Now);
    }

    /// <summary>
    /// Send en besked til en specifik gruppe
    /// </summary>
    /// <param name="groupName">Gruppens navn</param>
    /// <param name="user">Brugerens navn</param>
    /// <param name="message">Beskeden</param>
    public async Task SendMessageToGroup(string groupName, string user, string message)
    {
        await Clients.Group(groupName).SendAsync("ReceiveMessage", user, message, DateTime.Now);
    }

    /// <summary>
    /// Tilslut en bruger til en gruppe
    /// </summary>
    /// <param name="groupName">Gruppens navn</param>
    public async Task JoinGroup(string groupName)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
        await Clients.Group(groupName).SendAsync("UserJoinedGroup", "System", $"{Context.ConnectionId} har tilsluttet sig gruppen '{groupName}'");
    }

    /// <summary>
    /// Forlad en gruppe
    /// </summary>
    /// <param name="groupName">Gruppens navn</param>
    public async Task LeaveGroup(string groupName)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
        await Clients.Group(groupName).SendAsync("UserLeftGroup", "System", $"{Context.ConnectionId} har forladt gruppen '{groupName}'");
    }

    /// <summary>
    /// Send typing indicator til alle forbundne klienter
    /// </summary>
    /// <param name="user">Brugerens navn</param>
    public async Task SendTypingIndicator(string user)
    {
        await Clients.Others.SendAsync("UserTyping", user);
    }

    /// <summary>
    /// Send typing indicator til en specifik gruppe
    /// </summary>
    /// <param name="groupName">Gruppens navn</param>
    /// <param name="user">Brugerens navn</param>
    public async Task SendTypingIndicatorToGroup(string groupName, string user)
    {
        await Clients.GroupExcept(groupName, Context.ConnectionId).SendAsync("UserTyping", user);
    }

    /// <summary>
    /// Send stopped typing indicator til alle forbundne klienter
    /// </summary>
    /// <param name="user">Brugerens navn</param>
    public async Task SendStoppedTypingIndicator(string user)
    {
        await Clients.Others.SendAsync("UserStoppedTyping", user);
    }

    /// <summary>
    /// Send stopped typing indicator til en specifik gruppe
    /// </summary>
    /// <param name="groupName">Gruppens navn</param>
    /// <param name="user">Brugerens navn</param>
    public async Task SendStoppedTypingIndicatorToGroup(string groupName, string user)
    {
        await Clients.GroupExcept(groupName, Context.ConnectionId).SendAsync("UserStoppedTyping", user);
    }
}
