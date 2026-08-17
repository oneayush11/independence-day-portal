const PDFDocument = require("pdfkit");

/**
 * Streams a generated Independence Day quiz certificate PDF directly to the response.
 */
function streamCertificate(res, { name, score, total, certificateId, quizTitle }) {
  const doc = new PDFDocument({ layout: "landscape", size: "A4", margin: 0 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="certificate-${certificateId}.pdf"`);
  doc.pipe(res);

  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;

  // Background
  doc.rect(0, 0, pageWidth, pageHeight).fill("#FFF8EC");

  // Tricolor top & bottom bars
  doc.rect(0, 0, pageWidth, 18).fill("#FF9933");
  doc.rect(0, pageHeight - 18, pageWidth, 18).fill("#138808");

  // Border
  doc
    .lineWidth(3)
    .strokeColor("#0B2545")
    .rect(30, 40, pageWidth - 60, pageHeight - 80)
    .stroke();
  doc
    .lineWidth(1)
    .strokeColor("#FF9933")
    .rect(38, 48, pageWidth - 76, pageHeight - 96)
    .stroke();

  doc
    .fillColor("#0B2545")
    .font("Helvetica-Bold")
    .fontSize(14)
    .text("CERTIFICATE OF PARTICIPATION", 0, 90, { align: "center" });

  doc
    .fillColor("#FF9933")
    .font("Helvetica-Bold")
    .fontSize(30)
    .text("Independence Day Celebration", 0, 115, { align: "center" });

  doc
    .fillColor("#333333")
    .font("Helvetica")
    .fontSize(13)
    .text("This certificate is proudly presented to", 0, 175, { align: "center" });

  doc
    .fillColor("#138808")
    .font("Helvetica-Bold")
    .fontSize(28)
    .text(name, 0, 200, { align: "center" });

  doc
    .fillColor("#333333")
    .font("Helvetica")
    .fontSize(13)
    .text(
      `for participating in "${quizTitle}" and scoring ${score} out of ${total} on 15th August.`,
      100,
      245,
      { align: "center", width: pageWidth - 200 }
    );

  doc
    .fontSize(11)
    .fillColor("#555555")
    .text(`Certificate ID: ${certificateId}`, 0, 300, { align: "center" });

  doc
    .fontSize(11)
    .fillColor("#555555")
    .text(`Date: ${new Date().toLocaleDateString("en-IN")}`, 0, 318, { align: "center" });

  // Signature block: coordinator's name printed above the line, title below.
  // Set COORDINATOR_NAME in backend/.env to customize (defaults to "Admin").
  const coordinatorName = process.env.COORDINATOR_NAME || "Admin";

  doc
    .fontSize(13)
    .font("Helvetica-Bold")
    .fillColor("#0B2545")
    .text(coordinatorName, pageWidth / 2 - 100, 358, { width: 200, align: "center" });

  doc
    .moveTo(pageWidth / 2 - 100, 380)
    .lineTo(pageWidth / 2 + 100, 380)
    .strokeColor("#0B2545")
    .stroke();
  doc
    .fontSize(11)
    .font("Helvetica")
    .fillColor("#0B2545")
    .text("Event Coordinator", pageWidth / 2 - 100, 386, { width: 200, align: "center" });

  doc.end();
}

module.exports = { streamCertificate };