using API.Models.Dtos;
using API.Models.Entities;

namespace API.Mapping;

public static class UserMapping
{
    // Extension method syntax sugar.
    // An extension method lets you “add” methods to an existing type without modifying the type.
    // user.ToUserDto() - is compiled as UserMapping.ToUserDto(user)
    public static UserReponseDto ToUserDto(this User user)
    {
        return new UserReponseDto
        {
            Id = user.Id,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            RoleName = user.Role.Name,
        };
    }

    public static UserWithBookingsDto ToUserWithBookingsDto(this User user)
    {
        return new UserWithBookingsDto
        {
            Id = user.Id,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            RoleName = user.Role.Name,
            Bookings = user.Bookings,
        };
    }
}