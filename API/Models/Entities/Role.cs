namespace API.Models.Entities
{
    public class Role : Common
    {
        public required string Name { get; set; }

        // Navigation til brugeren (valgfrit ved 1:N)
        public List<User> Users { get; set; } = new();
    }
}
