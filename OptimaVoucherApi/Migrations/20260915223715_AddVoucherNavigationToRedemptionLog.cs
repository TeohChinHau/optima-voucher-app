using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OptimaVoucherApi.Migrations
{
    /// <inheritdoc />
    public partial class AddVoucherNavigationToRedemptionLog : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_RedemptionLogs_VoucherId",
                table: "RedemptionLogs",
                column: "VoucherId");

            migrationBuilder.AddForeignKey(
                name: "FK_RedemptionLogs_Vouchers_VoucherId",
                table: "RedemptionLogs",
                column: "VoucherId",
                principalTable: "Vouchers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_RedemptionLogs_Vouchers_VoucherId",
                table: "RedemptionLogs");

            migrationBuilder.DropIndex(
                name: "IX_RedemptionLogs_VoucherId",
                table: "RedemptionLogs");
        }
    }
}
