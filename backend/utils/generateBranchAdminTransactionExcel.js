const ExcelJS = require("exceljs");

async function generateBranchAdminTransactionExcel(transactions, filters, res) {
  const { startDate, endDate, totalAmount, count, branchName } = filters;

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Transaction Report");

  // Set column widths (without Origin Branch column)
  worksheet.getColumn(1).width = 20; // Tracking ID
  worksheet.getColumn(2).width = 20; // Customer Name
  worksheet.getColumn(3).width = 25; // Destination Branch
  worksheet.getColumn(4).width = 20; // Status
  worksheet.getColumn(5).width = 15; // Amount
  worksheet.getColumn(6).width = 12; // Weight
  worksheet.getColumn(7).width = 15; // Distance
  worksheet.getColumn(8).width = 15; // Delivery Date

  // Add Report Title
  worksheet.mergeCells('A1:H1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = "Transaction Report";
  titleCell.font = { bold: true, size: 16, color: { argb: "FFFFFFFF" } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFC76C3F' }
  };
  worksheet.getRow(1).height = 30;

  // Helper function to format date as dd-mm-yyyy
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  let currentRow = 2;

  // Add Branch Name
  if (branchName) {
    const branchRow = worksheet.getRow(currentRow);
    branchRow.getCell(1).value = "Branch:";
    branchRow.getCell(1).font = { bold: true };
    branchRow.getCell(2).value = branchName;
    worksheet.mergeCells(`B${currentRow}:D${currentRow}`);
    branchRow.height = 20;
    currentRow++;
  }

  // Add Date Range
  const dateRow = worksheet.getRow(currentRow);
  dateRow.getCell(1).value = "Date Range:";
  dateRow.getCell(1).font = { bold: true };
  dateRow.getCell(2).value = `${formatDate(startDate)} to ${formatDate(endDate)}`;
  worksheet.mergeCells(`B${currentRow}:D${currentRow}`);
  dateRow.height = 20;
  currentRow++;

  // Add Total Transactions
  const totalRow = worksheet.getRow(currentRow);
  totalRow.getCell(1).value = "Total Transactions:";
  totalRow.getCell(1).font = { bold: true };
  totalRow.getCell(1).alignment = { wrapText: false  };
  totalRow.getCell(2).value = count || 0;
  totalRow.getCell(2).alignment = { horizontal: 'left' };
  totalRow.height = 20;
  currentRow++;

  // Add Total Amount
  const amountRow = worksheet.getRow(currentRow);
  amountRow.getCell(1).value = "Total Amount:";
  amountRow.getCell(1).font = { bold: true };
  amountRow.getCell(2).value = `Rs ${totalAmount?.toFixed(2) || "0.00"}`;
  amountRow.height = 20;
  currentRow++;

  // Add empty row
  currentRow++;
  worksheet.addRow([]);

  // Add header row (without Origin Branch)
  currentRow++;
  const headerRow = worksheet.getRow(currentRow);
  headerRow.values = [
    "Tracking ID",
    "Customer Name",
    "Destination Branch",
    "Status",
    "Amount (Rs)",
    "Weight (kg)",
    "Distance (km)",
    "Delivery Date"
  ];
  
  headerRow.height = 20;

  // Style header cells
  for (let col = 1; col <= 8; col++) {
    const cell = headerRow.getCell(col);
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFC76C3F" },
    };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = {
      top: { style: "thin", color: { argb: "FFC76C3F" } },
      left: { style: "thin", color: { argb: "FFC76C3F" } },
      bottom: { style: "thin", color: { argb: "FFC76C3F" } },
      right: { style: "thin", color: { argb: "FFC76C3F" } },
    };
  }

  // Add data rows (without Origin Branch)
  transactions.forEach((transaction, index) => {
    const row = worksheet.addRow([
      transaction.trackingId || "N/A",
      transaction.customerName || "N/A",
      transaction.destinationBranch || "N/A",
      transaction.status || "N/A",
      transaction.amount || 0,
      transaction.weight || 0,
      transaction.distance || 0,
      formatDate(transaction.deliveryDate),
    ]);
    
    // Add borders and alignment
    row.alignment = { vertical: "middle", horizontal: "left" };
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin", color: { argb: "FFD3D3D3" } },
        left: { style: "thin", color: { argb: "FFD3D3D3" } },
        bottom: { style: "thin", color: { argb: "FFD3D3D3" } },
        right: { style: "thin", color: { argb: "FFD3D3D3" } },
      };
    });
  });

  // Set response headers
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=transaction_report_${Date.now()}.xlsx`
  );

  // Write to response
  await workbook.xlsx.write(res);
  res.end();
}

module.exports = generateBranchAdminTransactionExcel;
