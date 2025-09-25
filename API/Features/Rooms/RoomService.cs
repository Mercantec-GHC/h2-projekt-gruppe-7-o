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

        var availableRooms = await this.GetAvailableRoomsAsync(hotelId, checkIn, checkOut);

        var roomTypes = availableRooms.Rooms.GroupBy(r => r.Type);

        var roomTypeAvailabilities = roomTypes.Select(g => new RoomTypeAvailability
        {
            Type = g.Key,
            AvailableRoomsCount = g.Count()
        });


        return new RoomTypesAvailablityResponseDto
        {
            RoomTypeAvailabilities = roomTypeAvailabilities
        };
    }

    public async Task<AvailabilityResponseDto> GetAvailableRoomsAsync(
        Guid? hotelId = null, DateTime? checkIn = null, DateTime? checkOut = null)
    {
        // Sæt standarddatoer, hvis der ikke er angivet nogen
        var start = checkIn ?? DateTime.Today;
        var end = checkOut ?? DateTime.Today.AddDays(365);
        if (start >= end)
            throw new InvalidOperationException("Start date must be before end date.");

        // Beregn antal gæster

        // Hent alle rum
        var rooms = await _repository.GetAllAsync();

        // Filtrér på hotelId, hvis det er angivet, ellers brug alle rum
        var hotelRooms = hotelId.HasValue ? rooms.Where(r => r.HotelId == hotelId.Value).ToList() : rooms.ToList();

        // Hent bookinger, der overlapper perioden
        var overlappingBookings = await _bookingRepository.GetOverlappingBookingsAsync(
            hotelRooms.Select(r => r.Id).ToList(), start, end);

        // Find alle rum, som allerede er booket
        var bookedRoomIds = overlappingBookings
            .SelectMany(b => b.Rooms)
            .Select(r => r.Id)
            .Distinct()
            .ToList();

        var available = hotelRooms
            .Where(r => !bookedRoomIds.Contains(r.Id))
            .Select(r => r.ToRoomDto())
            .ToList();

        return new AvailabilityResponseDto
        {
            CheckIn = start,
            CheckOut = end,
            Rooms = available
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