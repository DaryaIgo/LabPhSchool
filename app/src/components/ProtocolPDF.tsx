import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { LabWork } from "@/data/labs";

interface ProtocolData {
  studentName: string;
  date: string;
  measurements: Record<string, string>[];
  conclusion: string;
}

export function generateProtocolPDF(lab: LabWork, data: ProtocolData): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header background
  doc.setFillColor(38, 46, 51); // #262e33
  doc.rect(0, 0, pageWidth, 50, "F");

  // Title
  doc.setTextColor(46, 239, 140); // #2eff8c
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("ПРОТОКОЛ ЛАБОРАТОРНОЙ РАБОТЫ", pageWidth / 2, 25, {
    align: "center",
  });

  // Subtitle
  doc.setTextColor(200, 205, 209);
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Физика | ${lab.topic}`, pageWidth / 2, 38, { align: "center" });

  // Student info
  doc.setTextColor(26, 26, 26);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  let y = 65;

  doc.setFont("helvetica", "bold");
  doc.text("Ученик:", 20, y);
  doc.setFont("helvetica", "normal");
  doc.text(data.studentName || "_________________", 45, y);

  y += 10;
  doc.setFont("helvetica", "bold");
  doc.text("Дата:", 20, y);
  doc.setFont("helvetica", "normal");
  doc.text(data.date || new Date().toLocaleDateString("ru-RU"), 40, y);

  // Lab title
  y += 20;
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(38, 46, 51);
  doc.text(lab.title, 20, y);

  // Goal
  y += 15;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(46, 239, 140);
  doc.text("Цель работы:", 20, y);
  y += 7;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60, 60, 60);
  const goalLines = doc.splitTextToSize(lab.goal, pageWidth - 40);
  doc.text(goalLines, 20, y);
  y += goalLines.length * 6 + 10;

  // Equipment
  doc.setFont("helvetica", "bold");
  doc.setTextColor(46, 239, 140);
  doc.text("Оборудование:", 20, y);
  y += 7;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60, 60, 60);
  lab.equipment.forEach((item, i) => {
    doc.text(`${i + 1}. ${item}`, 25, y);
    y += 6;
  });
  y += 8;

  // Theory
  doc.setFont("helvetica", "bold");
  doc.setTextColor(46, 239, 140);
  doc.text("Теоретическая часть:", 20, y);
  y += 7;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60, 60, 60);
  const theoryLines = doc.splitTextToSize(lab.theory, pageWidth - 40);
  doc.text(theoryLines, 20, y);
  y += theoryLines.length * 6 + 10;

  // Check if we need a new page
  if (y > 230) {
    doc.addPage();
    y = 30;
  }

  // Procedure
  doc.setFont("helvetica", "bold");
  doc.setTextColor(46, 239, 140);
  doc.text("Ход работы:", 20, y);
  y += 7;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60, 60, 60);
  lab.procedure.forEach((step, i) => {
    const stepLines = doc.splitTextToSize(`${i + 1}. ${step}`, pageWidth - 40);
    doc.text(stepLines, 20, y);
    y += stepLines.length * 6;
  });
  y += 10;

  // Measurements table
  if (y > 200) {
    doc.addPage();
    y = 30;
  }

  doc.setFont("helvetica", "bold");
  doc.setTextColor(46, 239, 140);
  doc.text("Результаты измерений:", 20, y);
  y += 10;

  // Build table data
  const headers = lab.tableHeaders.map(h => h.label);
  const bodyData =
    data.measurements.length > 0
      ? data.measurements.map(row =>
          lab.tableHeaders.map(h => row[h.key] || "")
        )
      : [lab.tableHeaders.map(() => "")];

  autoTable(doc, {
    startY: y,
    head: [headers],
    body: bodyData,
    theme: "grid",
    headStyles: {
      fillColor: [38, 46, 51],
      textColor: [46, 239, 140],
      fontStyle: "bold",
      fontSize: 10,
    },
    bodyStyles: {
      fontSize: 10,
      textColor: [60, 60, 60],
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    styles: {
      cellPadding: 4,
    },
    margin: { left: 20, right: 20 },
  });

  // Conclusion
  const tableEndY =
    (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable
      ?.finalY || y + 40;
  let conclusionY = tableEndY + 15;

  if (conclusionY > 250) {
    doc.addPage();
    conclusionY = 30;
  }

  doc.setFont("helvetica", "bold");
  doc.setTextColor(46, 239, 140);
  doc.text("Вывод:", 20, conclusionY);
  conclusionY += 7;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60, 60, 60);
  const conclusionText = data.conclusion || lab.conclusionTemplate;
  const conclusionLines = doc.splitTextToSize(conclusionText, pageWidth - 40);
  doc.text(conclusionLines, 20, conclusionY);
  conclusionY += conclusionLines.length * 6 + 20;

  // Signature
  if (conclusionY > 260) {
    doc.addPage();
    conclusionY = 40;
  }
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(10);
  doc.text(
    "Подпись ученика: _______________    Подпись преподавателя: _______________",
    pageWidth / 2,
    conclusionY,
    {
      align: "center",
    }
  );

  // Footer on every page
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Страница ${i} из ${totalPages} | Лабораторная работа: ${lab.title}`,
      pageWidth / 2,
      285,
      {
        align: "center",
      }
    );
    doc.text("Академия Квант | Физика", pageWidth / 2, 290, {
      align: "center",
    });
  }

  // Save
  doc.save(
    `protocol_${lab.slug}_${data.date || new Date().toISOString().slice(0, 10)}.pdf`
  );
}
