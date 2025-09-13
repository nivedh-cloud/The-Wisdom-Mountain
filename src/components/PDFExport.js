import jsPDF from 'jspdf';
import 'jspdf-autotable';

export function exportGridToPDF({ columns, data, title, lang }) {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text(title, 14, 18);
  doc.setFontSize(11);
  doc.setTextColor(100);

  const tableColumn = columns.map(col => col.header);
  const tableRows = data.map(row =>
    columns.map(col => {
      let value = row[col.dataKey];
      if (col.langKey && lang === 'te' && row[col.langKey]) {
        value = row[col.langKey];
      }
      if (col.formatter) {
        value = col.formatter(value, row, lang);
      }
      return value || '';
    })
  );

  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 28,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [99, 102, 241] },
    alternateRowStyles: { fillColor: [240, 240, 255] },
    margin: { left: 14, right: 14 }
  });

  doc.save(`${title.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`);
}
