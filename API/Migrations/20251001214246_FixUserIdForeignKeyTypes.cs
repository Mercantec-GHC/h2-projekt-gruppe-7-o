using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API.Migrations
{
    /// <inheritdoc />
    public partial class FixUserIdForeignKeyTypes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TicketMessages_Users_UserId1",
                table: "TicketMessages");

            migrationBuilder.DropForeignKey(
                name: "FK_Tickets_Users_AssignedToUserId1",
                table: "Tickets");

            migrationBuilder.DropForeignKey(
                name: "FK_Tickets_Users_CreatedByUserId1",
                table: "Tickets");

            migrationBuilder.DropIndex(
                name: "IX_Tickets_AssignedToUserId1",
                table: "Tickets");

            migrationBuilder.DropIndex(
                name: "IX_Tickets_CreatedByUserId1",
                table: "Tickets");

            migrationBuilder.DropIndex(
                name: "IX_TicketMessages_UserId1",
                table: "TicketMessages");

            migrationBuilder.DropColumn(
                name: "AssignedToUserId1",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId1",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "UserId1",
                table: "TicketMessages");

            // Convert string columns to UUID with explicit casting
            // First, clear any invalid data that can't be converted to UUID
            migrationBuilder.Sql(@"
                UPDATE ""Tickets""
                SET ""CreatedByUserId"" = NULL
                WHERE ""CreatedByUserId"" IS NOT NULL
                AND ""CreatedByUserId"" !~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
            ");

            migrationBuilder.Sql(@"
                UPDATE ""Tickets""
                SET ""AssignedToUserId"" = NULL
                WHERE ""AssignedToUserId"" IS NOT NULL
                AND ""AssignedToUserId"" !~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
            ");

            // For TicketMessages, we need to handle the non-nullable UserId column
            // Delete any messages with invalid UserId (they would be orphaned anyway)
            migrationBuilder.Sql(@"
                DELETE FROM ""TicketMessages""
                WHERE ""UserId"" IS NULL
                OR ""UserId"" = ''
                OR ""UserId"" !~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
            ");

            // Now convert the columns using USING clause
            migrationBuilder.Sql(@"
                ALTER TABLE ""Tickets""
                ALTER COLUMN ""CreatedByUserId"" TYPE uuid
                USING CASE
                    WHEN ""CreatedByUserId"" IS NULL THEN NULL
                    ELSE ""CreatedByUserId""::uuid
                END
            ");

            migrationBuilder.Sql(@"
                ALTER TABLE ""Tickets""
                ALTER COLUMN ""AssignedToUserId"" TYPE uuid
                USING CASE
                    WHEN ""AssignedToUserId"" IS NULL THEN NULL
                    ELSE ""AssignedToUserId""::uuid
                END
            ");

            migrationBuilder.Sql(@"
                ALTER TABLE ""TicketMessages""
                ALTER COLUMN ""UserId"" TYPE uuid
                USING ""UserId""::uuid
            ");

            migrationBuilder.CreateIndex(
                name: "IX_Tickets_AssignedToUserId",
                table: "Tickets",
                column: "AssignedToUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Tickets_CreatedByUserId",
                table: "Tickets",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_TicketMessages_UserId",
                table: "TicketMessages",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_TicketMessages_Users_UserId",
                table: "TicketMessages",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Tickets_Users_AssignedToUserId",
                table: "Tickets",
                column: "AssignedToUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Tickets_Users_CreatedByUserId",
                table: "Tickets",
                column: "CreatedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TicketMessages_Users_UserId",
                table: "TicketMessages");

            migrationBuilder.DropForeignKey(
                name: "FK_Tickets_Users_AssignedToUserId",
                table: "Tickets");

            migrationBuilder.DropForeignKey(
                name: "FK_Tickets_Users_CreatedByUserId",
                table: "Tickets");

            migrationBuilder.DropIndex(
                name: "IX_Tickets_AssignedToUserId",
                table: "Tickets");

            migrationBuilder.DropIndex(
                name: "IX_Tickets_CreatedByUserId",
                table: "Tickets");

            migrationBuilder.DropIndex(
                name: "IX_TicketMessages_UserId",
                table: "TicketMessages");

            // Convert back to string columns
            migrationBuilder.Sql(@"
                ALTER TABLE ""Tickets""
                ALTER COLUMN ""CreatedByUserId"" TYPE text
                USING CASE
                    WHEN ""CreatedByUserId"" IS NULL THEN NULL
                    ELSE ""CreatedByUserId""::text
                END
            ");

            migrationBuilder.Sql(@"
                ALTER TABLE ""Tickets""
                ALTER COLUMN ""AssignedToUserId"" TYPE text
                USING CASE
                    WHEN ""AssignedToUserId"" IS NULL THEN NULL
                    ELSE ""AssignedToUserId""::text
                END
            ");

            migrationBuilder.AddColumn<Guid>(
                name: "AssignedToUserId1",
                table: "Tickets",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedByUserId1",
                table: "Tickets",
                type: "uuid",
                nullable: true);

            migrationBuilder.Sql(@"
                ALTER TABLE ""TicketMessages""
                ALTER COLUMN ""UserId"" TYPE text
                USING ""UserId""::text
            ");

            migrationBuilder.AddColumn<Guid>(
                name: "UserId1",
                table: "TicketMessages",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_Tickets_AssignedToUserId1",
                table: "Tickets",
                column: "AssignedToUserId1");

            migrationBuilder.CreateIndex(
                name: "IX_Tickets_CreatedByUserId1",
                table: "Tickets",
                column: "CreatedByUserId1");

            migrationBuilder.CreateIndex(
                name: "IX_TicketMessages_UserId1",
                table: "TicketMessages",
                column: "UserId1");

            migrationBuilder.AddForeignKey(
                name: "FK_TicketMessages_Users_UserId1",
                table: "TicketMessages",
                column: "UserId1",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Tickets_Users_AssignedToUserId1",
                table: "Tickets",
                column: "AssignedToUserId1",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Tickets_Users_CreatedByUserId1",
                table: "Tickets",
                column: "CreatedByUserId1",
                principalTable: "Users",
                principalColumn: "Id");
        }
    }
}
