import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { Invoice, ScrapyardReport } from '@/types/models'
import { MaterialType, UnitOfMeasure } from '@/types/models'

const MATERIAL_LABELS: Record<MaterialType, string> = {
  [MaterialType.ALUMINIUM]: 'Aluminum',
  [MaterialType.IRON]: 'Iron',
  [MaterialType.MOTOR]: 'Motor',
  [MaterialType.BATTERY]: 'Battery',
  [MaterialType.STAINLESS_STEEL]: 'Stainless Steel',
  [MaterialType.REFER]: 'Refer',
  [MaterialType.CIRCUIT_BOARD]: 'Circuit Board',
  [MaterialType.COPPER]: 'Copper',
  [MaterialType.BRASS]: 'Brass',
  [MaterialType.CATALYST]: 'Catalyst',
  [MaterialType.ALUMINIUM_CANS]: 'Aluminum Cans',
}

const UNIT_LABELS: Record<UnitOfMeasure, string> = {
  [UnitOfMeasure.KILOGRAMS]: 'kg',
  [UnitOfMeasure.POUNDS]: 'lbs',
  [UnitOfMeasure.TONNES]: 'ton',
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

function formatCustomerType(type: string): string {
  switch (type) {
    case 'REGULAR': return 'Regular'
    case 'VIP': return 'VIP'
    case 'WHOLESALE': return 'Wholesale'
    default: return type
  }
}

export function generateInvoicePDF(invoice: Invoice): void {
  const doc = new jsPDF()

  const primaryColor: [number, number, number] = [26, 115, 232]
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 16

  // ========== HEADER ==========
  doc.setFontSize(22)
  doc.setTextColor(...primaryColor)
  doc.text('SYMS', margin, 20)
  doc.setFontSize(8)
  doc.setTextColor(128, 134, 139)
  doc.text('Scrapyard Management System', margin, 27)

  // Invoice number & date block
  doc.setFontSize(12)
  doc.setTextColor(32, 33, 36)
  doc.text(`Invoice #${invoice.invoiceId}`, pageWidth - margin, 20, { align: 'right' })
  doc.setFontSize(9)
  doc.setTextColor(95, 99, 104)
  doc.text(`Date: ${formatDate(invoice.createdAt)}`, pageWidth - margin, 27, { align: 'right' })

  // Divider line
  doc.setDrawColor(...primaryColor)
  doc.setLineWidth(0.5)
  doc.line(margin, 33, pageWidth - margin, 33)

  // ========== CUSTOMER & YARD INFO ==========
  const infoY = 42
  doc.setFontSize(11)
  doc.setTextColor(32, 33, 36)
  doc.text('Customer', margin, infoY)
  doc.setFontSize(9)
  doc.setTextColor(95, 99, 104)
  doc.text(invoice.customerName, margin, infoY + 6)
  doc.text(`Type: ${formatCustomerType(invoice.customerType)}`, margin, infoY + 12)
  doc.text(`Customer ID: ${invoice.customerId}`, margin, infoY + 18)

  const col2x = pageWidth / 2 + 10
  doc.setFontSize(11)
  doc.setTextColor(32, 33, 36)
  doc.text('Scrapyard', col2x, infoY)
  doc.setFontSize(9)
  doc.setTextColor(95, 99, 104)
  doc.text(invoice.scrapyardName || '-', col2x, infoY + 6)
  doc.text(`Manager: ${invoice.managerName || '-'}`, col2x, infoY + 12)

  // Status badge
  const statusLabel = 'Active'
  doc.setFillColor(232, 240, 254)
  doc.setTextColor(26, 115, 232)
  doc.roundedRect(col2x, infoY + 16, 24, 7, 3, 3, 'F')
  doc.setFontSize(7)
  doc.text(statusLabel, col2x + 12, infoY + 21, { align: 'center' })

  // ========== DETAILS TABLE ==========
  const tableStartY = infoY + 36
  doc.setFontSize(11)
  doc.setTextColor(32, 33, 36)
  doc.text('Invoice Details', margin, tableStartY - 4)

  const subtotals = invoice.details?.map((d) => d.weight * d.unitPrice) || []

  autoTable(doc, {
    startY: tableStartY,
    head: [['Material', 'Weight', 'Unit Price', 'Container', 'Subtotal']],
    body: (invoice.details || []).map((d, i) => [
      MATERIAL_LABELS[d.materialType] || d.materialType,
      `${d.weight} ${UNIT_LABELS[d.unit]}`,
      `$${(d.unitPrice || 0).toFixed(2)}`,
      `#${d.containerId}`,
      `$${(subtotals[i] || 0).toFixed(2)}`,
    ]),
    theme: 'striped',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      cellPadding: { top: 6, right: 4, bottom: 6, left: 4 },
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [32, 33, 36],
      cellPadding: { top: 5, right: 4, bottom: 5, left: 4 },
    },
    alternateRowStyles: {
      fillColor: [248, 249, 250],
    },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { halign: 'right' as const },
      2: { halign: 'right' as const },
      3: { halign: 'center' as const },
      4: { halign: 'right' as const },
    },
    margin: { left: margin, right: margin },
    styles: {
      lineColor: [218, 220, 224],
      lineWidth: 0.3,
    },
  })

  // ========== TOTALS ==========
  const totalsY = (doc as any).lastAutoTable.finalY + 8
  const totalSubtotal = (invoice.details || []).reduce((sum, d) => sum + d.weight * d.unitPrice, 0)
  const totalDiscount = invoice.discount || 0
  const totalPaid = invoice.totalPaid || 0

  const rightX = pageWidth - margin

  doc.setFontSize(9)
  doc.setTextColor(95, 99, 104)
  doc.text('Lines', margin + 10, totalsY)
  doc.setFontSize(9)
  doc.setTextColor(32, 33, 36)
  doc.text(`${invoice.details?.length || 0}`, rightX, totalsY, { align: 'right' })

  doc.setFontSize(9)
  doc.setTextColor(95, 99, 104)
  doc.text('Subtotal', margin + 10, totalsY + 8)
  doc.setTextColor(32, 33, 36)
  doc.text(`$${totalSubtotal.toFixed(2)}`, rightX, totalsY + 8, { align: 'right' })

  doc.setFontSize(9)
  doc.setTextColor(95, 99, 104)
  doc.text('Discount', margin + 10, totalsY + 16)
  doc.setTextColor(217, 48, 37)
  doc.text(`- $${totalDiscount.toFixed(2)}`, rightX, totalsY + 16, { align: 'right' })

  // Divider above total
  doc.setDrawColor(218, 220, 224)
  doc.setLineWidth(0.3)
  doc.line(margin + 10, totalsY + 21, rightX, totalsY + 21)

  doc.setFontSize(12)
  doc.setTextColor(32, 33, 36)
  doc.text('Total Paid', margin + 10, totalsY + 30)
  doc.setTextColor(30, 142, 62)
  doc.text(`$${totalPaid.toFixed(2)}`, rightX, totalsY + 30, { align: 'right' })

  // ========== FOOTER ==========
  const footerY = doc.internal.pageSize.getHeight() - 10
  doc.setFontSize(7)
  doc.setTextColor(189, 193, 198)
  doc.text(`Generated by SYMS on ${new Date().toLocaleDateString('en-US')}`, margin, footerY, { align: 'left' })
  doc.text(`Page 1 of 1`, pageWidth - margin, footerY, { align: 'right' })

  doc.save(`invoice-${invoice.invoiceId}.pdf`)
}

export function generateReportPDF(report: ScrapyardReport): void {
  const doc = new jsPDF()

  const primaryColor: [number, number, number] = [26, 115, 232]
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 16

  const periodLabels: Record<string, string> = {
    WEEKLY: 'Weekly', MONTHLY: 'Monthly', QUARTERLY: 'Quarterly', SEMIANNUAL: 'Semi-Annual',
  }

  const reportLabels: Record<string, string> = {
    PURCHASES: 'Purchases', PRICING: 'Material Pricing',
  }

  // Header
  doc.setFontSize(22)
  doc.setTextColor(...primaryColor)
  doc.text('SYMS', margin, 20)
  doc.setFontSize(8)
  doc.setTextColor(128, 134, 139)
  doc.text('Scrapyard Management System', margin, 27)

  doc.setFontSize(12)
  doc.setTextColor(32, 33, 36)
  doc.text(`Report: ${reportLabels[report.reportType] || report.reportType}`, pageWidth - margin, 20, { align: 'right' })
  doc.setFontSize(9)
  doc.setTextColor(95, 99, 104)
  doc.text(`Period: ${periodLabels[report.period] || report.period}`, pageWidth - margin, 27, { align: 'right' })

  doc.setDrawColor(...primaryColor)
  doc.setLineWidth(0.5)
  doc.line(margin, 33, pageWidth - margin, 33)

  // Scrapyard info
  const infoY = 42
  doc.setFontSize(11)
  doc.setTextColor(32, 33, 36)
  doc.text(report.scrapyardName, margin, infoY)
  doc.setFontSize(9)
  doc.setTextColor(95, 99, 104)
  doc.text(`Date Range: ${formatDate(report.startDate)} - ${formatDate(report.endDate)}`, margin, infoY + 7)

  // Stats
  const statsY = infoY + 22
  doc.setFontSize(10)
  doc.setTextColor(32, 33, 36)
  doc.text(`Total Invested: $${(report.totalInvested || 0).toFixed(2)}`, margin, statsY)
  doc.text(`Invoices: ${report.invoiceCount ?? 0}`, pageWidth / 2, statsY)

  // Table
  const tableStartY = statsY + 12

  if (report.reportType === 'PURCHASES' && report.invoices?.length) {
    autoTable(doc, {
      startY: tableStartY,
      head: [['# Invoice', 'Customer', 'Date', 'Total']],
      body: report.invoices.map((inv) => [
        `#${inv.invoiceId}`,
        inv.customerName,
        formatDate(inv.createdAt),
        `$${(inv.totalPaid || 0).toFixed(2)}`,
      ]),
      theme: 'striped',
      headStyles: { fillColor: primaryColor, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
      bodyStyles: { fontSize: 9, textColor: [32, 33, 36] },
      alternateRowStyles: { fillColor: [248, 249, 250] },
      margin: { left: margin, right: margin },
      styles: { lineColor: [218, 220, 224], lineWidth: 0.3 },
    })
  } else if (report.reportType === 'PRICING' && report.materialPricing?.length) {
    autoTable(doc, {
      startY: tableStartY,
      head: [['Material', 'Total Weight (lbs)', 'Total Spent', 'Avg Unit Price', 'Lines']],
      body: report.materialPricing.map((mp) => [
        MATERIAL_LABELS[mp.materialType] || mp.materialType,
        (mp.totalWeight || 0).toFixed(2),
        `$${(mp.totalSpent || 0).toFixed(2)}`,
        `$${(mp.averageUnitPrice || 0).toFixed(4)}`,
        String(mp.lineCount || 0),
      ]),
      theme: 'striped',
      headStyles: { fillColor: primaryColor, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
      bodyStyles: { fontSize: 9, textColor: [32, 33, 36] },
      alternateRowStyles: { fillColor: [248, 249, 250] },
      margin: { left: margin, right: margin },
      styles: { lineColor: [218, 220, 224], lineWidth: 0.3 },
    })
  }

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 10
  doc.setFontSize(7)
  doc.setTextColor(189, 193, 198)
  doc.text(`Generated by SYMS on ${new Date().toLocaleDateString('en-US')}`, margin, footerY, { align: 'left' })
  doc.text(`Page 1 of 1`, pageWidth - margin, footerY, { align: 'right' })

  doc.save(`report-${report.scrapyardName.replace(/\s+/g, '-').toLowerCase()}-${report.period.toLowerCase()}.pdf`)
}
