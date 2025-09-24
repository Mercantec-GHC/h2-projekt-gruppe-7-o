using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API.Migrations
{
    /// <inheritdoc />
    public partial class AddFamilyRoomType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:Enum:booking_status", "cancelled,confirmed,pending")
                .Annotation("Npgsql:Enum:room_type", "deluxe,family,standard,suite")
                .OldAnnotation("Npgsql:Enum:booking_status", "cancelled,confirmed,pending")
                .OldAnnotation("Npgsql:Enum:room_type", "deluxe,standard,suite");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:Enum:booking_status", "cancelled,confirmed,pending")
                .Annotation("Npgsql:Enum:room_type", "deluxe,standard,suite")
                .OldAnnotation("Npgsql:Enum:booking_status", "cancelled,confirmed,pending")
                .OldAnnotation("Npgsql:Enum:room_type", "deluxe,family,standard,suite");
        }
    }
}
