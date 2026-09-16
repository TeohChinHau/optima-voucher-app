using QuestPDF.Fluent;
using QuestPDF.Infrastructure;
using OptimaVoucherApi.Models;

namespace OptimaVoucherApi.Services;

public static class PdfGenerator
{
    static PdfGenerator()
    {
        QuestPDF.Settings.License = LicenseType.Community;
    }

    public static byte[] GenerateVoucherPdf(RedemptionLog log, Voucher voucher)
    {
        using var stream = new MemoryStream();
        Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Content().Column(col =>
                {
                    col.Item().Text(voucher.Title).FontSize(20).Bold();
                    col.Item().Text($"Redeemed: {log.RedeemedAt:dd MMM yyyy}");
                    col.Item().Text($"Quantity: {log.Quantity}");
                });
            });
        }).GeneratePdf(stream);
        return stream.ToArray();
    }
}