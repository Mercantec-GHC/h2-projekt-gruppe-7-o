using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;
using NpgsqlTypes;

namespace API.Models.Entities;

[Index(nameof(Number), IsUnique = true)]
public class Room : Entity<Guid>
{
    [StringLength(32)] public required string Number { get; set; }
    public required short Capacity { get; set; }
    public required decimal PricePerNight { get; set; }
    public required RoomType Type { get; set; } = RoomType.Standard;
    public required short Floor { get; set; }
    public string Description { get; set; } = string.Empty;

    public bool IsActive { get; set; } = false;


    public required Guid HotelId { get; set; }

    public Hotel? Hotel { get; init; }

    public ICollection<Booking> Bookings { get; init; } = new List<Booking>();
    public string? ImageUrl { get; set; }



    // Nødvendige felter for Housekeeping:
    public int HousekeepingStatus { get; set; } // Brug en Enum eller et int ID (se Status Reference)
    public Guid? AssignedHousekeeperId { get; set; } // ID'et for den tildelte medarbejder
    public DateTime? LastServiceRequested { get; set; } // Tidspunkt for sidste anmodning om rengøring (for DND/DS)
    public string? MaintenanceNote { get; set; } // Note, hvis der er rapporteret en fejl
    public bool IsPriority { get; set; } // F.eks. for VIP eller tidlig indtjekning
    public required DateTimeOffset LastStatusUpdateTime { get; set; } // Tidspunkt for sidste statusændring


}

public enum RoomType
{
    [PgName("standard")] Standard,

    [PgName("deluxe")] Deluxe,

    [PgName("family")] Family,

    [PgName("suite")] Suite

}

public enum HousekeepingStatus
{
    CleanReady = 1,          // Rent - Klar (VC)
    DirtyCheckout = 2,       // Beskidt - Tjek Ud (DCO) - Højeste prioritet
    DirtyStayOver = 3,       // Beskidt - Ophold (DS)
    AwaitingInspection = 4,  // Rent - Inspektionsklar (CI)
    OutOfOrder = 5,          // Ude af Drift (OOO)
    DoNotDisturb = 6         // Forstyr Ikke (DND)
}