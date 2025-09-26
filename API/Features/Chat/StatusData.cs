using API.Models.Entities;
using System.ComponentModel.DataAnnotations;

namespace API.Features.Chat
{
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
}
