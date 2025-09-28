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
}