using Microsoft.AspNetCore.SignalR;

namespace API.Hubs;


/// <summary>
/// SignalR Hub for status og monitoring
/// Giver real-time information om aktive forbindelser og sessioner
/// </summary>
public class StatusHub : Hub
{
    private static readonly Dictionary<string, ConnectionInfo> _connections = new();
    private static readonly object _connectionsLock = new();

    /// <summary>
    /// Når en klient forbinder til status hub'en
    /// </summary>
    public override async Task OnConnectedAsync()
    {
        var connectionInfo = new ConnectionInfo
        {
            ConnectionId = Context.ConnectionId,
            ConnectedAt = DateTime.Now,
            UserAgent = Context.GetHttpContext()?.Request.Headers["User-Agent"].ToString() ?? "Unknown",
            RemoteIpAddress = Context.GetHttpContext()?.Connection.RemoteIpAddress?.ToString() ?? "Unknown",
            IsStatusMonitor = true
        };

        lock (_connectionsLock)
        {
            _connections[Context.ConnectionId] = connectionInfo;
        }

        await Clients.All.SendAsync("StatusUpdated", GetStatusData());
        await base.OnConnectedAsync();
    }

    /// <summary>
    /// Når en klient afbryder forbindelsen til status hub'en
    /// </summary>
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        lock (_connectionsLock)
        {
            _connections.Remove(Context.ConnectionId);
        }

        await Clients.All.SendAsync("StatusUpdated", GetStatusData());
        await base.OnDisconnectedAsync(exception);
    }

    /// <summary>
    /// Hent aktuel status data
    /// </summary>
    public StatusData GetStatusData()
    {
        lock (_connectionsLock)
        {
            var chatConnections = _connections.Values.Where(c => !c.IsStatusMonitor).ToList();
            var statusConnections = _connections.Values.Where(c => c.IsStatusMonitor).ToList();

            return new StatusData
            {
                TotalConnections = _connections.Count,
                ChatConnections = chatConnections.Count,
                StatusConnections = statusConnections.Count,
                ActiveUsers = chatConnections.Where(c => !string.IsNullOrEmpty(c.Username)).Select(c => c.Username!).Distinct().ToList(),
                Connections = _connections.Values.ToList(),
                LastUpdated = DateTime.Now
            };
        }
    }

    /// <summary>
    /// Registrer en chat forbindelse
    /// </summary>
    public static void RegisterChatConnection(string connectionId, string username)
    {
        lock (_connectionsLock)
        {
            if (_connections.TryGetValue(connectionId, out var connection))
            {
                connection.Username = username;
                connection.IsChatConnection = true;
            }
            else
            {
                _connections[connectionId] = new ConnectionInfo
                {
                    ConnectionId = connectionId,
                    Username = username,
                    ConnectedAt = DateTime.Now,
                    IsChatConnection = true
                };
            }
        }
    }

    /// <summary>
    /// Fjern en chat forbindelse
    /// </summary>
    public static void RemoveChatConnection(string connectionId)
    {
        lock (_connectionsLock)
        {
            _connections.Remove(connectionId);
        }
    }

    /// <summary>
    /// Hent live status data
    /// </summary>
    public Task<StatusData> GetLiveStatus()
    {
        return Task.FromResult(GetStatusData());
    }
}

/// <summary>
/// Information om en forbindelse
/// </summary>
public class ConnectionInfo
{
    public string ConnectionId { get; set; } = "";
    public string? Username { get; set; }
    public DateTime ConnectedAt { get; set; }
    public string UserAgent { get; set; } = "";
    public string RemoteIpAddress { get; set; } = "";
    public bool IsChatConnection { get; set; }
    public bool IsStatusMonitor { get; set; }
    public TimeSpan ConnectionDuration => DateTime.Now - ConnectedAt;
}

/// <summary>
/// Status data for monitoring
/// </summary>
public class StatusData
{
    public int TotalConnections { get; set; }
    public int ChatConnections { get; set; }
    public int StatusConnections { get; set; }
    public List<string> ActiveUsers { get; set; } = new();
    public List<ConnectionInfo> Connections { get; set; } = new();
    public DateTime LastUpdated { get; set; }
}
