using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API.Migrations
{
    /// <inheritdoc />
    public partial class AddHousekeepingFunctionalityToRooms : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "AssignedHousekeeperId",
                table: "Rooms",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "HousekeepingStatus",
                table: "Rooms",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "IsPriority",
                table: "Rooms",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastServiceRequested",
                table: "Rooms",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "LastStatusUpdateTime",
                table: "Rooms",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)));

            migrationBuilder.AddColumn<string>(
                name: "MaintenanceNote",
                table: "Rooms",
                type: "text",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "TicketStatuses",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 9, 29, 23, 21, 2, 296, DateTimeKind.Unspecified).AddTicks(192), new TimeSpan(0, 2, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 9, 29, 23, 21, 2, 296, DateTimeKind.Unspecified).AddTicks(869), new TimeSpan(0, 2, 0, 0, 0)) });

            migrationBuilder.UpdateData(
                table: "TicketStatuses",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 9, 29, 23, 21, 2, 296, DateTimeKind.Unspecified).AddTicks(1280), new TimeSpan(0, 2, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 9, 29, 23, 21, 2, 296, DateTimeKind.Unspecified).AddTicks(1290), new TimeSpan(0, 2, 0, 0, 0)) });

            migrationBuilder.UpdateData(
                table: "TicketStatuses",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 9, 29, 23, 21, 2, 296, DateTimeKind.Unspecified).AddTicks(1293), new TimeSpan(0, 2, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 9, 29, 23, 21, 2, 296, DateTimeKind.Unspecified).AddTicks(1296), new TimeSpan(0, 2, 0, 0, 0)) });

            migrationBuilder.CreateIndex(
                name: "IX_Rooms_AssignedHousekeeperId",
                table: "Rooms",
                column: "AssignedHousekeeperId");

            migrationBuilder.AddForeignKey(
                name: "FK_Rooms_Users_AssignedHousekeeperId",
                table: "Rooms",
                column: "AssignedHousekeeperId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Rooms_Users_AssignedHousekeeperId",
                table: "Rooms");

            migrationBuilder.DropIndex(
                name: "IX_Rooms_AssignedHousekeeperId",
                table: "Rooms");

            migrationBuilder.DropColumn(
                name: "AssignedHousekeeperId",
                table: "Rooms");

            migrationBuilder.DropColumn(
                name: "HousekeepingStatus",
                table: "Rooms");

            migrationBuilder.DropColumn(
                name: "IsPriority",
                table: "Rooms");

            migrationBuilder.DropColumn(
                name: "LastServiceRequested",
                table: "Rooms");

            migrationBuilder.DropColumn(
                name: "LastStatusUpdateTime",
                table: "Rooms");

            migrationBuilder.DropColumn(
                name: "MaintenanceNote",
                table: "Rooms");

            migrationBuilder.UpdateData(
                table: "TicketStatuses",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 9, 26, 17, 34, 23, 449, DateTimeKind.Unspecified).AddTicks(7875), new TimeSpan(0, 2, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 9, 26, 17, 34, 23, 449, DateTimeKind.Unspecified).AddTicks(8962), new TimeSpan(0, 2, 0, 0, 0)) });

            migrationBuilder.UpdateData(
                table: "TicketStatuses",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 9, 26, 17, 34, 23, 449, DateTimeKind.Unspecified).AddTicks(9801), new TimeSpan(0, 2, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 9, 26, 17, 34, 23, 449, DateTimeKind.Unspecified).AddTicks(9825), new TimeSpan(0, 2, 0, 0, 0)) });

            migrationBuilder.UpdateData(
                table: "TicketStatuses",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTimeOffset(new DateTime(2025, 9, 26, 17, 34, 23, 449, DateTimeKind.Unspecified).AddTicks(9837), new TimeSpan(0, 2, 0, 0, 0)), new DateTimeOffset(new DateTime(2025, 9, 26, 17, 34, 23, 449, DateTimeKind.Unspecified).AddTicks(9841), new TimeSpan(0, 2, 0, 0, 0)) });
        }
    }
}
