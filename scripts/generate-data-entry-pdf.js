const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

const outputPath = path.join(process.cwd(), "download", "police-data-entry-search-template.pdf");

function drawHeader(doc, title, subtitle) {
  doc
    .fillColor("#0B1120")
    .fontSize(20)
    .font("Helvetica-Bold")
    .text(title, { align: "center" });

  doc
    .moveDown(0.2)
    .fillColor("#41506a")
    .fontSize(10)
    .font("Helvetica")
    .text(subtitle, { align: "center" });

  doc.moveDown(1);
}

function sectionTitle(doc, title) {
  doc
    .fillColor("#1A237E")
    .fontSize(13)
    .font("Helvetica-Bold")
    .text(title);
  doc.moveDown(0.4);
}

function labelLine(doc, label, width = 180) {
  const y = doc.y;
  doc
    .fillColor("#0B1120")
    .fontSize(10)
    .font("Helvetica-Bold")
    .text(label, 50, y, { continued: true });
  doc
    .fillColor("#94a3b8")
    .font("Helvetica")
    .text("  ________________________________________________", { width });
  doc.moveDown(0.65);
}

function bullet(doc, text) {
  doc
    .fillColor("#0B1120")
    .fontSize(10)
    .font("Helvetica")
    .text(`• ${text}`, { indent: 12 });
}

function tableRow(doc, cells, widths, isHeader = false) {
  const startX = 50;
  const startY = doc.y;
  const rowHeight = isHeader ? 24 : 22;
  let x = startX;

  cells.forEach((cell, index) => {
    const width = widths[index];
    doc
      .rect(x, startY, width, rowHeight)
      .strokeColor("#cbd5e1")
      .lineWidth(0.75)
      .stroke();
    doc
      .fillColor(isHeader ? "#1A237E" : "#0B1120")
      .fontSize(isHeader ? 9 : 8.5)
      .font(isHeader ? "Helvetica-Bold" : "Helvetica")
      .text(String(cell), x + 4, startY + 6, {
        width: width - 8,
        align: "left",
      });
    x += width;
  });

  doc.y = startY + rowHeight;
}

function buildPdf() {
  const doc = new PDFDocument({ size: "A4", margin: 50, bufferPages: true });
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);

  doc.info.Title = "TZ Police Data Entry and Search Template";
  doc.info.Author = "TZ Police Digital Platform";
  doc.info.Subject = "Printable form for search and data entry";
  doc.info.Keywords = "NIDA, mobile, users, vehicle, police, search, data entry";

  drawHeader(
    doc,
    "TZ POLICE DATA ENTRY & SEARCH TEMPLATE",
    "Printable reference sheet for officers to search or capture records using NIDA, mobile, and identity details."
  );

  sectionTitle(doc, "1. Search / Entry Details");
  labelLine(doc, "Full Name");
  labelLine(doc, "NIDA Number");
  labelLine(doc, "Mobile Number");
  labelLine(doc, "Vehicle Plate");
  labelLine(doc, "Driving License No.");
  labelLine(doc, "National ID / Passport No.");
  labelLine(doc, "Station / Zone");
  labelLine(doc, "Case / File Number");
  labelLine(doc, "Officer Name");
  labelLine(doc, "Notes");

  doc.moveDown(0.4);
  sectionTitle(doc, "2. Quick Search Fields");
  bullet(doc, "Use NIDA to locate the citizen record.");
  bullet(doc, "Use mobile number to confirm contact details.");
  bullet(doc, "Use vehicle plate to pull owner, insurance, and citation history.");
  bullet(doc, "Use license number for driver verification and enforcement.");
  bullet(doc, "Use case number to retrieve active incidents or court files.");

  doc.moveDown(0.6);
  sectionTitle(doc, "3. Data Capture Checklist");
  bullet(doc, "Name matches official ID document.");
  bullet(doc, "Mobile number is active and reachable.");
  bullet(doc, "NIDA is 15 digits and verified.");
  bullet(doc, "Vehicle plate is recorded exactly as shown.");
  bullet(doc, "Station and officer name are written clearly.");

  doc.addPage();
  drawHeader(
    doc,
    "REFERENCE TABLE",
    "Use this page to validate the record type before entering or searching data."
  );

  sectionTitle(doc, "Field Guide");
  const widths = [110, 160, 170];
  tableRow(doc, ["Field", "Purpose", "Example"], widths, true);
  tableRow(doc, ["Full Name", "Identify the person", "Juma Khamis Mwinyi"], widths);
  tableRow(doc, ["NIDA", "Primary citizen lookup", "199012031234567"], widths);
  tableRow(doc, ["Mobile", "Contact and notification", "0712 345 678"], widths);
  tableRow(doc, ["Vehicle Plate", "Owner and vehicle history", "T123ABC"], widths);
  tableRow(doc, ["License No.", "Driver verification", "DL001001TZ"], widths);
  tableRow(doc, ["Case No.", "Incident or court reference", "INC-2026-0341"], widths);
  tableRow(doc, ["Station", "Location / office", "Kituo Kikuu DSM"], widths);

  doc.moveDown(1.2);
  sectionTitle(doc, "Usage Notes");
  bullet(doc, "This form is a printable template. It is not a live database record.");
  bullet(doc, "If you want a version filled with actual mock records, I can generate that next.");
  bullet(doc, "If you want editable form fields, I can convert this into a fillable PDF layout.");

  doc.end();

  stream.on("finish", () => {
    console.log(outputPath);
  });
}

buildPdf();