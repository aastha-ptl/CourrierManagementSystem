const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

function generateBranchAdminReportPDF(couriers, filters, res) {
  const { startDate, endDate, status, branchName } = filters;

  // Helper function to format dates as dd-mm-yyyy
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const doc = new PDFDocument({ margin: 50, size: "A4" });

  // Set response headers
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=courier_report_${Date.now()}.pdf`
  );

  doc.pipe(res);

  // ================================
  // Header with Logo
  // ================================
  const logoPath = path.join(__dirname, "../image/logo3.jpg");
  const logoWidth = 50;
  const spacing = 15;
  const textBlockWidth = 220;
  const totalHeaderWidth = logoWidth + spacing + textBlockWidth;
  const pageCenter = doc.page.width / 2;
  const startX = pageCenter - totalHeaderWidth / 2;
  const logoY = 40;

  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, startX, logoY, { width: logoWidth, height: logoWidth });
    const textX = startX + logoWidth + spacing;
    const textY = logoY + 10;

    doc
      .font("Helvetica-Bold")
      .fontSize(20)
      .fillColor("black")
      .text("Courier Report", textX, textY);

    doc
      .font("Helvetica-Oblique")
      .fontSize(10)
      .fillColor("gray")
      .text("Smart Deliveries. Seamless Experiences.", textX, textY + 24);
  } else {
    doc
      .font("Helvetica-Bold")
      .fontSize(20)
      .fillColor("black")
      .text("Courier Report", { align: "center" });
  }

  doc.fillColor("black");
  doc.moveDown(3);

  // ================================
  // Report Filters Summary
  // ================================
  doc.font("Helvetica-Bold").fontSize(12).text("Report Filters", 50, doc.y, { underline: true });
  doc.moveDown(0.5);
  doc.font("Helvetica").fontSize(10);
  if (branchName) {
    doc.text(`Branch: ${branchName}`, 50);
  }
  doc.text(`Date Range: ${formatDate(startDate)} to ${formatDate(endDate)}`, 50);
  if (status && status !== "All") doc.text(`Status: ${status}`, 50);
  doc.text(`Total Couriers: ${couriers.length}`, 50);
  doc.moveDown(1.5);

  // ================================
  // Table Header (without Origin column)
  // ================================
  const tableTop = doc.y;
  const colPositions = {
    trackingId: 50,
    sender: 115,
    receiver: 180,
    dest: 245,
    status: 345,
    booked: 415,
    delivered: 480,
  };

  // Draw header background
  doc
    .rect(40, tableTop - 5, 520, 22)
    .fillAndStroke("#C76C3F", "#C76C3F");

  // Header text
  doc.font("Helvetica-Bold").fontSize(8.5).fillColor("white");
  doc.text("Track ID", colPositions.trackingId, tableTop + 2, { width: 65 });
  doc.text("Sender", colPositions.sender, tableTop + 2, { width: 65 });
  doc.text("Receiver", colPositions.receiver, tableTop + 2, { width: 65 });
  doc.text("Destination", colPositions.dest, tableTop + 2, { width: 100 });
  doc.text("Status", colPositions.status, tableTop + 2, { width: 70 });
  doc.text("Booked", colPositions.booked, tableTop + 2, { width: 65 });
  doc.text("Delivered", colPositions.delivered, tableTop + 2, { width: 80 });

  doc.fillColor("black");
  doc.moveDown(1.8);

  // ================================
  // Table Rows
  // ================================
  doc.font("Helvetica").fontSize(7.5);
  let rowIndex = 0;

  couriers.forEach((courier) => {
    const y = doc.y;

    // Add new page if needed
    if (y > doc.page.height - 100) {
      doc.addPage();
      doc.y = 50;
      rowIndex = 0; // Reset row index for alternating colors
    }

    // Alternating row background
    if (rowIndex % 2 === 0) {
      doc.rect(40, y - 2, 520, 20).fill("#ffffff");
    }

    doc.fillColor("black");
    doc.text(courier.trackingId || "N/A", colPositions.trackingId, y, { width: 65, lineBreak: false });
    doc.text(courier.sender?.name || "N/A", colPositions.sender, y, { width: 65, lineBreak: false });
    doc.text(courier.receiver?.name || "N/A", colPositions.receiver, y, { width: 65, lineBreak: false });
    doc.text(courier.destinationBranch?.branchName || "N/A", colPositions.dest, y, { width: 100, lineBreak: false });
    doc.text(courier.status || "N/A", colPositions.status, y, { width: 70, lineBreak: false });
    doc.text(formatDate(courier.createdAt), colPositions.booked, y, { width: 65, lineBreak: false });
    doc.text(
      courier.status === "Delivered" && courier.deliveryDate
        ? formatDate(courier.deliveryDate)
        : "-",
      colPositions.delivered,
      y,
      { width: 80, lineBreak: false }
    );

    doc.moveDown(1.4);
    rowIndex++;
  });

  // ================================
  // Footer
  // ================================
  const footerY = doc.page.height - 80;
  doc
    .font("Helvetica-Oblique")
    .fontSize(10)
    .fillColor("black")
    .text("Thank you for using DakiyaPro Courier Services!", 0, footerY, {
      align: "center",
      width: doc.page.width,
    });

  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor("gray")
    .text("Visit us: www.dakiyapro.com", 0, footerY + 15, {
      align: "center",
      width: doc.page.width,
    });

  doc.end();
}

module.exports = generateBranchAdminReportPDF;
