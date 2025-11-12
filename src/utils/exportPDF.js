// src/utils/exportPDF.js
import { jsPDF } from "jspdf";
import "jspdf-autotable";

export const exportToPDF = (data) => {
  const doc = new jsPDF();
  doc.setFont("helvetica", "bold");
  doc.text("Laporan Stok Outlet", 14, 15);

  let startY = 25;

  data.forEach((laporan, idx) => {
    doc.setFontSize(12);
    doc.text(`Tarikh: ${laporan.tarikh}`, 14, startY);
    startY += 5;

    const rows = laporan.stok.map((s) => [
      s.item,
      s.unit,
      s.stockIn,
      s.baki,
      s.order,
      s.remark,
    ]);

    doc.autoTable({
      startY,
      head: [["Item", "Unit", "Stock In", "Baki", "Order", "Remark"]],
      body: rows,
      theme: "grid",
      headStyles: { fillColor: [66, 185, 131] },
    });

    startY = doc.lastAutoTable.finalY + 10;
  });

  doc.save("Laporan_Stok.pdf");
};
