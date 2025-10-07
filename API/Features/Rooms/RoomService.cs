using API.Mapping;
using API.Models.Dtos;
using API.Models.Entities;
using API.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace API.Services;

public class RoomService
{
    private readonly IRoomRepository _repository;
    private readonly IBookingRepository _bookingRepository;
    private readonly IMemoryCache _cache;

    public RoomService(IRoomRepository repository, IBookingRepository bookingRepository, IMemoryCache cache)
    {
        _repository = repository;
        _bookingRepository = bookingRepository;
        _cache = cache;
    }

    public async Task<IEnumerable<RoomResponseDto>> GetAllRoomsAsync()
    {
        string cacheKey = "all_rooms";
        if (_cache.TryGetValue(cacheKey, out List<RoomResponseDto> cachedRooms))
            return cachedRooms;

        var rooms = await _repository.GetAllAsync();
        var roomDtos = rooms.Select(r => r.ToRoomDto()).ToList();
        _cache.Set(cacheKey, roomDtos, TimeSpan.FromSeconds(30));
        return roomDtos;
    }

    public async Task<RoomResponseDto?> GetRoomByIdAsync(Guid id)
    {
        var room = await _repository.GetByIdAsync(id);
        return room?.ToRoomDto();
    }

    public async Task<RoomResponseDto> CreateRoomAsync(RoomCreateDto dto)
    {
        var room = dto.ToRoom();
        await _repository.AddAsync(room);
        await _repository.SaveChangesAsync();
        _cache.Remove("all_rooms");
        return room.ToRoomDto();
    }

    public async Task<bool> DeleteRoomAsync(Guid id)
    {
        var room = await _repository.GetByIdAsync(id);
        if (room == null) return false;

        await _repository.DeleteByIdAsync(id);
        await _repository.SaveChangesAsync();
        _cache.Remove("all_rooms");
        return true;
    }



    private const string HousekeepingCacheKey = "housekeeping_dashboard";

    public async Task<IEnumerable<RoomResponseDto>> GetHousekeepingDashboardStatusAsync()
    {
        if (_cache.TryGetValue(HousekeepingCacheKey, out List<RoomResponseDto> cachedRooms))
            return cachedRooms;

        var rooms = await _repository.GetRoomsWithHousekeepingDetailsAsync();

        var roomDtos = rooms.Select(r => r.ToRoomDto()).ToList();

        // Caching
        _cache.Set(HousekeepingCacheKey, roomDtos, TimeSpan.FromSeconds(15));

        return roomDtos;
    }

    public async Task<IEnumerable<RoomResponseDto>> GetAssignedRoomsAsync(Guid housekeeperId)
    {
        
        var rooms = await _repository.GetAssignedRoomsByHousekeeperAsync(housekeeperId);

        return rooms.Select(r => r.ToRoomDto()).ToList();
    }



    public async Task<RoomTypesAvailablityResponseDto> GetAvailableRoomTypesAsync(
        Guid hotelId, DateTime checkIn, DateTime checkOut)
    {
        if (checkIn >= checkOut)
        {
            throw new InvalidOperationException("Start date must be before end date.");
        }

        // 1. Brug den nye hjælpefunktion til at hente de rå Room-entiteter.
        var availableRoomsEntities = await this.GetAvailableRoomEntitiesAsync(hotelId, checkIn, checkOut);

        // Beregn antal nætter for at kunne udregne TotalPrice
        int numberOfNights = (int)(checkOut - checkIn).TotalDays;

        // 2. Gruppér efter Type og udfyld RoomTypeAvailability DTO'en
        var roomTypeAvailabilities = availableRoomsEntities
            .GroupBy(r => r.Type)
            .Select(g =>
            {
                // Vælg det første værelse i gruppen for at hente de statiske oplysninger (pris, beskrivelse, billede)
                var sampleRoom = g.First();

                return new RoomTypeAvailability
                {
                    Type = g.Key.ToString(),
                    Capacity = sampleRoom.Capacity,
                    AvailableRoomsCount = g.Count(),
                    PricePerNight = sampleRoom.PricePerNight,
                    TotalPrice = sampleRoom.PricePerNight * numberOfNights,
                    RoomImageUrl = sampleRoom.ImageUrl,
                    RoomDescription = sampleRoom.Description
                };
            })
            .ToList();


        return new RoomTypesAvailablityResponseDto
        {
            RoomTypeAvailabilities = roomTypeAvailabilities
        };
    }

    private async Task<List<Room>> GetAvailableRoomEntitiesAsync(
        Guid? hotelId = null, DateTime? checkIn = null, DateTime? checkOut = null)
    {
        var start = checkIn ?? DateTime.Today;
        var end = checkOut ?? DateTime.Today.AddDays(365);
        if (start >= end)
            throw new InvalidOperationException("Start date must be before end date.");

        // Hent alle rum
        var rooms = await _repository.GetAllAsync();

        // Filtrér på hotelId, hvis det er angivet
        var hotelRooms = hotelId.HasValue ? rooms.Where(r => r.HotelId == hotelId.Value).ToList() : rooms.ToList();

        // Hent bookinger, der overlapper perioden
        var overlappingBookings = await _bookingRepository.GetOverlappingBookingsAsync(
            hotelRooms.Select(r => r.Id).ToList(), start, end);

        // Find alle rum-ID'er, som allerede er booket og som ikke er annulleret
        var bookedRoomIds = overlappingBookings.Where(b => b.Status != BookingStatus.Cancelled)
            .SelectMany(b => b.Rooms)
            .Select(r => r.Id)
            .Distinct()
            .ToList();

        // Returner de FULDE Room-entiteter, som er ledige
        var available = hotelRooms
            .Where(r => !bookedRoomIds.Contains(r.Id))
            .ToList();

        return available;
    }


    public async Task<AvailabilityResponseDto> GetAvailableRoomsAsync(
        Guid? hotelId = null, DateTime? checkIn = null, DateTime? checkOut = null)
    {
        var start = checkIn ?? DateTime.Today;
        var end = checkOut ?? DateTime.Today.AddDays(365);
        if (start >= end)
            throw new InvalidOperationException("Start date must be before end date.");


        var availableEntities = await this.GetAvailableRoomEntitiesAsync(hotelId, checkIn, checkOut);

        // Konverter entiteterne til DTO'er
        var availableDtos = availableEntities.Select(r => r.ToRoomDto()).ToList();

        return new AvailabilityResponseDto
        {
            CheckIn = start,
            CheckOut = end,
            Rooms = availableDtos
        };
    }


    public async Task<AvailabilityResponseDto> GetUnavailableRoomsAsync(
        Guid? hotelId = null, DateTime? checkIn = null, DateTime? checkOut = null)
    {
        // Sæt standarddatoer, hvis der ikke er angivet nogen
        var start = checkIn ?? DateTime.Today;
        var end = checkOut ?? DateTime.Today.AddDays(365);

        if (start >= end)
            throw new InvalidOperationException("Start date must be before end date.");

        // Hent alle rum
        var rooms = await _repository.GetAllAsync();

        // Filtrér på hotelId, hvis det er angivet, ellers brug alle rum
        var hotelRooms = hotelId.HasValue ? rooms.Where(r => r.HotelId == hotelId.Value).ToList() : rooms.ToList();

        if (!hotelRooms.Any())
            return new AvailabilityResponseDto
            {
                CheckIn = start,
                CheckOut = end,
                Rooms = new List<RoomResponseDto>()
            };

        // Hent bookinger, der overlapper perioden
        var overlappingBookings = await _bookingRepository.GetOverlappingBookingsAsync(
            hotelRooms.Select(r => r.Id).ToList(), start, end);

        // Find alle rum, som allerede er booket
        var bookedRoomIds = overlappingBookings
            .SelectMany(b => b.Rooms)
            .Select(r => r.Id)
            .Distinct()
            .ToList();

        var unavailable = hotelRooms
            .Where(r => bookedRoomIds.Contains(r.Id))
            .Select(r => r.ToRoomDto())
            .ToList();

        return new AvailabilityResponseDto
        {
            CheckIn = start,
            CheckOut = end,
            Rooms = unavailable
        };
    }


    /// <summary>
    /// Opdaterer et værelses Housekeeping Status.
    /// </summary>
    public async Task<RoomResponseDto?> UpdateRoomHousekeepingStatusAsync(
        Guid roomId, HousekeepingStatus newStatus)
    {
        var room = await _repository.GetByIdAsync(roomId);
        if (room == null) return null;


        // Håndtering af tildeling og noter baseret på status
        Guid? newHousekeeperId = null;
        string? newMaintenanceNote = null;

        if (newStatus == HousekeepingStatus.CleanReady) // VC
        {
            // Rydder tildeling og noter, når værelset er klar
            newHousekeeperId = null;
            newMaintenanceNote = null;
        }
        else if (newStatus == HousekeepingStatus.DirtyCheckout ||
                 newStatus == HousekeepingStatus.DirtyStayOver)
        {
            // Rydder tildeling 
            newHousekeeperId = null;
        }

       
        var updatedRoom = await _repository.UpdateHousekeepingFieldsAsync(
            roomId,
            (int)newStatus,
            newHousekeeperId,
            newMaintenanceNote,
            isPriority: null); 

        if (updatedRoom == null) return null;

        await _repository.SaveChangesAsync();

        _cache.Remove(HousekeepingCacheKey);
        _cache.Remove("all_rooms");

        return updatedRoom.ToRoomDto();
    }


    /// <summary>
    /// Tildeler et værelse til en Housekeeper.
    /// </summary>
    public async Task<RoomResponseDto?> AssignRoomToHousekeeperAsync(Guid roomId, Guid housekeeperId)
    {
        var room = await _repository.GetByIdAsync(roomId);
        if (room == null) return null;

        var updatedRoom = await _repository.UpdateHousekeepingFieldsAsync(
            roomId,
            assignedHousekeeperId: housekeeperId);

        if (updatedRoom == null) return null;

        await _repository.SaveChangesAsync();

        _cache.Remove(HousekeepingCacheKey);

        return updatedRoom.ToRoomDto();
    }


    /// <summary>
    /// Rapporterer en vedligeholdelsesfejl for et værelse.
    /// </summary>
    public async Task<RoomResponseDto?> ReportMaintenanceAsync(Guid roomId, string note)
    {
        var room = await _repository.GetByIdAsync(roomId);
        if (room == null) return null;

        // Opdater status og note
        var updatedRoom = await _repository.UpdateHousekeepingFieldsAsync(
            roomId,
            newStatus: (int)HousekeepingStatus.OutOfOrder, // Sætter til OOO ved fejl
            maintenanceNote: note);

        if (updatedRoom == null) return null;

        await _repository.SaveChangesAsync();

        _cache.Remove(HousekeepingCacheKey);

        return updatedRoom.ToRoomDto();
    }
}