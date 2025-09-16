using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API.Migrations
{
    /// <inheritdoc />
    public partial class UpdateUserForAD : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BookingRoom_Bookings_BookingsId",
                table: "BookingRoom");

            migrationBuilder.DropForeignKey(
                name: "FK_BookingRoom_Rooms_RoomsId",
                table: "BookingRoom");

            migrationBuilder.DropPrimaryKey(
                name: "PK_BookingRoom",
                table: "BookingRoom");

            migrationBuilder.RenameTable(
                name: "BookingRoom",
                newName: "BookingRooms");

            migrationBuilder.RenameIndex(
                name: "IX_BookingRoom_RoomsId",
                table: "BookingRooms",
                newName: "IX_BookingRooms_RoomsId");

            migrationBuilder.AlterColumn<string>(
                name: "HashedPassword",
                table: "Users",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddColumn<bool>(
                name: "IsADUser",
                table: "Users",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddPrimaryKey(
                name: "PK_BookingRooms",
                table: "BookingRooms",
                columns: new[] { "BookingsId", "RoomsId" });

            migrationBuilder.AddForeignKey(
                name: "FK_BookingRooms_Bookings_BookingsId",
                table: "BookingRooms",
                column: "BookingsId",
                principalTable: "Bookings",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_BookingRooms_Rooms_RoomsId",
                table: "BookingRooms",
                column: "RoomsId",
                principalTable: "Rooms",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BookingRooms_Bookings_BookingsId",
                table: "BookingRooms");

            migrationBuilder.DropForeignKey(
                name: "FK_BookingRooms_Rooms_RoomsId",
                table: "BookingRooms");

            migrationBuilder.DropPrimaryKey(
                name: "PK_BookingRooms",
                table: "BookingRooms");

            migrationBuilder.DropColumn(
                name: "IsADUser",
                table: "Users");

            migrationBuilder.RenameTable(
                name: "BookingRooms",
                newName: "BookingRoom");

            migrationBuilder.RenameIndex(
                name: "IX_BookingRooms_RoomsId",
                table: "BookingRoom",
                newName: "IX_BookingRoom_RoomsId");

            migrationBuilder.AlterColumn<string>(
                name: "HashedPassword",
                table: "Users",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_BookingRoom",
                table: "BookingRoom",
                columns: new[] { "BookingsId", "RoomsId" });

            migrationBuilder.AddForeignKey(
                name: "FK_BookingRoom_Bookings_BookingsId",
                table: "BookingRoom",
                column: "BookingsId",
                principalTable: "Bookings",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_BookingRoom_Rooms_RoomsId",
                table: "BookingRoom",
                column: "RoomsId",
                principalTable: "Rooms",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
