const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

function generateTransactionPDF(transactions, filters, res) {
  const { startDate, endDate, totalAmount, count, branchName } = filters;

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
    `attachment; filename=transaction_report_${Date.now()}.pdf`
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
      .text("Transaction Report", textX, textY);

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
      .text("Transaction Report", { align: "center" });
  }

  doc.fillColor("black");
  doc.moveDown(3);

  // ================================
  // Report Summary
  // ================================
  doc.font("Helvetica-Bold").fontSize(12).text("Report Summary", 50, doc.y, { underline: true });
  doc.moveDown(0.5);
  doc.font("Helvetica").fontSize(10);
  if (branchName && branchName !== "All") {
    doc.text(`Branch: ${branchName}`, 50);
  }
  doc.text(`Date Range: ${formatDate(startDate)} to ${formatDate(endDate)}`, 50);
  doc.text(`Total Transactions: ${count || 0}`, 50);
  doc.text(`Total Amount: Rs ${totalAmount?.toFixed(2) || "0.00"}`, 50);
  doc.moveDown(1.5);

  // ================================
  // Table Header
  // ================================
  const tableTop = doc.y;
  const colPositions = {
    trackingId: 50,
    customer: 100,
    origin: 150,
    dest: 220,
    status: 290,
    amount: 350,
    weight: 395,
    distance: 437,
    delivery: 485,
  };

  // Draw header background
  doc
    .rect(40, tableTop - 5, 520, 20)
    .fillAndStroke("#C76C3F", "#C76C3F");

  // Header text
  doc.font("Helvetica-Bold").fontSize(7.5).fillColor("white");
  doc.text("Track ID", colPositions.trackingId, tableTop, { width: 50 });
  doc.text("Customer", colPositions.customer, tableTop, { width: 50 });
  doc.text("Origin", colPositions.origin, tableTop, { width: 70 });
  doc.text("Dest.", colPositions.dest, tableTop, { width: 70 });
  doc.text("Status", colPositions.status, tableTop, { width: 60 });
  doc.text("Amount", colPositions.amount, tableTop, { width: 45 });
  doc.text("Weight", colPositions.weight, tableTop, { width: 42 });
  doc.text("Dist.", colPositions.distance, tableTop, { width: 48 });
  doc.text("Delivered", colPositions.delivery, tableTop, { width: 75 });

  doc.fillColor("black");
  doc.moveDown(1.5);

  // ================================
  // Table Rows
  // ================================
  doc.font("Helvetica").fontSize(8);
  let rowIndex = 0;

  transactions.forEach((transaction) => {
    const y = doc.y;

    // Add new page if needed
    if (y > doc.page.height - 100) {
      doc.addPage();
      doc.y = 50;
      rowIndex = 0;
    }

    // Alternating row background with increased height
    if (rowIndex % 2 === 0) {
      doc.rect(40, y - 2, 520, 28).fill("#ffffff");
    }

    doc.fillColor("black");
    doc.text(transaction.trackingId || "N/A", colPositions.trackingId, y, { width: 50, lineBreak: false });
    doc.text(transaction.customerName || "N/A", colPositions.customer, y, { width: 50, lineBreak: false });
    doc.text(transaction.originBranch || "N/A", colPositions.origin, y, { width: 70, lineBreak: false });
    doc.text(transaction.destinationBranch || "N/A", colPositions.dest, y, { width: 70, lineBreak: false });
    doc.text(transaction.status || "N/A", colPositions.status, y, { width: 60, lineBreak: false });
    doc.text(`Rs ${transaction.amount?.toFixed(2) || "0.00"}`, colPositions.amount, y, { width: 45, lineBreak: false });
    doc.text(`${transaction.weight || 0}kg`, colPositions.weight, y, { width: 42, lineBreak: false });
    doc.text(`${transaction.distance || 0}km`, colPositions.distance, y, { width: 48, lineBreak: false });
    doc.text(formatDate(transaction.deliveryDate), colPositions.delivery, y, { width: 75, lineBreak: false });

    doc.moveDown(2);
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

module.exports = generateTransactionPDF;
