const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

function generateCourierReceipt(courierData) {
  const doc = new PDFDocument({ margin: 50 });

  const receiptsDir = path.join(__dirname, "../receipts");
  if (!fs.existsSync(receiptsDir)) {
    fs.mkdirSync(receiptsDir, { recursive: true });
  }

  const filePath = path.join(receiptsDir, `${courierData.trackingId}.pdf`);
  const writeStream = fs.createWriteStream(filePath);
  doc.pipe(writeStream);

  // ================================
  // 🔰 Header
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
      .fontSize(18)
      .fillColor("black")
      .text("Courier Receipt", textX, textY);

    doc
      .font("Helvetica-Oblique")
      .fontSize(10)
      .fillColor("gray")
      .text("Smart Deliveries. Seamless Experiences.", textX, textY + 22);
  }

  doc.fillColor("black");
  doc.moveDown(4);

  // =========================================
  // 📦 Courier Summary
  // =========================================
  const baseDate = new Date(courierData.createdAt);
  const deliveryDays = Math.ceil(courierData.distanceInKm / 500);
  const estimatedDeliveryDate = new Date(baseDate);
  estimatedDeliveryDate.setDate(baseDate.getDate() + deliveryDays);

  const originFull = `${courierData.originBranchName}, ${courierData.originBranchAddress}`;
  const destinationFull = `${courierData.destinationBranchName}, ${courierData.destinationBranchAddress}`;
  doc.font("Helvetica-Bold").fontSize(12).fillColor("black").text("Courier Summary", 60, doc.y, { underline: true });
  doc.moveDown(0.3);

  drawLeftAlignedTable(doc, {
    "Tracking ID": courierData.trackingId,
    "Status": courierData.status,
    "Weight": `${courierData.weight} kg`,
    "Distance": `${courierData.distanceInKm} km`,
    "Price": `Rs.${courierData.price}`,
    "Created At": baseDate.toLocaleString(),
    "Estimated Delivery": estimatedDeliveryDate.toLocaleDateString(),
    "Origin Branch": originFull,
    "Destination Branch": destinationFull,
  });

  doc.moveDown(1);

  // =========================================
  // 🙋 Sender Details
  // =========================================
  doc.font("Helvetica-Bold").fontSize(12).fillColor("black").text("Sender Details", 60, doc.y, { underline: true });
  doc.moveDown(0.3);

  drawLeftAlignedTable(doc, {
    "Name": courierData.sender.name,
    "Phone": courierData.sender.phone,
    "Email": courierData.sender.email,
    "Address": `${courierData.sender.address}, ${courierData.sender.pincode}`,
  });

  doc.moveDown(1);

  // =========================================
  // 📥 Receiver Details
  // =========================================
  doc.font("Helvetica-Bold").fontSize(12).fillColor("black").text("Receiver Details", 60, doc.y, { underline: true });
  doc.moveDown(0.3);

  drawLeftAlignedTable(doc, {
    "Name": courierData.receiver.name,
    "Phone": courierData.receiver.phone,
    "Email": courierData.receiver.email,
    "Address": `${courierData.receiver.address}, ${courierData.receiver.pincode}`,
  });

  // =========================================
  // 📍 Footer
  // =========================================
  const footerY = doc.page.height - 80;

  doc.font("Helvetica-Oblique")
    .fontSize(10)
    .fillColor("black")
    .text("Thank you for choosing DakiyaPro Courier Services!", 0, footerY, {
      align: "center",
      width: doc.page.width,
    });

  doc.font("Helvetica")
    .fontSize(8)
    .fillColor("gray")
    .text("Visit us: www.dakiyapro.com", 0, footerY + 15, {
      align: "center",
      width: doc.page.width,
    });

  doc.end();
  console.log("Receipt generated at:", filePath);
}

// 🧠 Enhanced label:value renderer
function drawLeftAlignedTable(doc, data) {
  const labelX = 60;
  const valueX = 180;
  const maxWidth = doc.page.width - valueX - 60;
  const lineHeight = 16;
  let y = doc.y;

  for (const [key, value] of Object.entries(data)) {
    const height = doc.heightOfString(value, { width: maxWidth });

    doc.font("Helvetica-Bold")
      .fontSize(10)
      .fillColor("black")
      .text(`${key}:`, labelX, y);

    doc.font("Helvetica")
      .fontSize(10)
      .fillColor("black")
      .text(value, valueX, y, { width: maxWidth });

    y += Math.max(height, lineHeight);
  }

  doc.moveDown(0.2);
}

module.exports = generateCourierReceipt;
