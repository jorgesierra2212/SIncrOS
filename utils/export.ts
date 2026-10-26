import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import PptxGenJS from 'pptxgenjs';

export function exportTableToExcel(data: Record<string, any>[], filename = 'exportacion.xlsx', sheetName = 'Datos') {
  if (!data || data.length === 0) return;
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, filename);
}

export function exportArtifactToPDF(title: string, contentLines: string[], filename = 'artefacto.pdf', metadata?: { id: string; version: number | string; author: string; layer: string }) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Header banner
  doc.setFillColor(15, 30, 51); // ink #0F1E33
  doc.rect(0, 0, 210, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('ENERSINC OS · MERCADO DE ENERGÍA MAYORISTA', 14, 12);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(157, 180, 238);
  doc.text(`Artefacto: ${metadata?.id || 'ART'} | Versión: ${metadata?.version || '1.0'} | Capa: ${metadata?.layer || 'Núcleo'} | Generado: ${new Date().toLocaleDateString('es-CO')}`, 14, 20);

  // Body
  doc.setTextColor(20, 34, 53);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, 40);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 75, 95);

  let y = 50;
  for (const line of contentLines) {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    const splitLines = doc.splitTextToSize(line, 182);
    for (const s of splitLines) {
      doc.text(s, 14, y);
      y += 6;
    }
  }

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(120, 130, 145);
  doc.text('Documento confidencial generado por Enersinc OS. Datos ilustrativos del Mercado de Energía Mayorista de Colombia (XM).', 14, 285);

  doc.save(filename);
}

export function exportExecutiveToPPT(title = 'Resumen Ejecutivo · Enersinc OS', kpis?: { label: string; value: string }[]) {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_16x9';

  // Slide 1: Cover
  const slide1 = pptx.addSlide();
  slide1.background = { color: '0F1E33' }; // ink
  slide1.addText('ENERSINC OS', {
    x: 1.0,
    y: 1.5,
    w: 8.0,
    h: 0.8,
    fontSize: 28,
    bold: true,
    color: 'FFFFFF',
  });
  slide1.addText('Espacio de trabajo agéntico para el Mercado Eléctrico Colombiano (XM)', {
    x: 1.0,
    y: 2.3,
    w: 8.5,
    h: 0.6,
    fontSize: 14,
    color: '9DB4EE',
  });
  slide1.addText(`Fecha de emisión: ${new Date().toLocaleDateString('es-CO')}`, {
    x: 1.0,
    y: 4.8,
    w: 6.0,
    h: 0.4,
    fontSize: 11,
    color: '7F8DA3',
  });

  // Slide 2: KPIs & Executive Summary
  const slide2 = pptx.addSlide();
  slide2.background = { color: 'EEF1F4' }; // paper
  slide2.addText(title, {
    x: 0.8,
    y: 0.5,
    w: 8.5,
    h: 0.6,
    fontSize: 20,
    bold: true,
    color: '0F1E33',
  });

  const cards = kpis || [
    { label: 'Ventas Netas en Bolsa', value: '$18.420 M' },
    { label: 'Reconciliación Positiva (RecPos)', value: '$1.332,9 M (+$48,4 M TX2)' },
    { label: 'Garantías Proyectadas', value: '$3.418 M (Brecha: $612 M)' },
    { label: 'Fronteras en Monitoreo SRM', value: '1.284 (99,1 % lectura íntegra)' },
  ];

  cards.forEach((card, idx) => {
    const xPos = 0.8 + (idx % 2) * 4.8;
    const yPos = 1.4 + Math.floor(idx / 2) * 1.8;
    slide2.addShape(pptx.ShapeType.rect, {
      x: xPos,
      y: yPos,
      w: 4.5,
      h: 1.5,
      fill: { color: 'FFFFFF' },
      line: { color: 'D9DEE5', width: 1 },
    });
    slide2.addText(card.label, {
      x: xPos + 0.3,
      y: yPos + 0.2,
      w: 4.0,
      h: 0.4,
      fontSize: 12,
      color: '5E6B7C',
    });
    slide2.addText(card.value, {
      x: xPos + 0.3,
      y: yPos + 0.6,
      w: 4.0,
      h: 0.6,
      fontSize: 18,
      bold: true,
      color: '2459D6',
    });
  });

  pptx.writeFile({ fileName: 'Resumen_Ejecutivo_Enersinc_OS.pptx' });
}
