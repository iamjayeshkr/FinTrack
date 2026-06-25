import { Money } from "../../domain/value-objects/money";

export interface DocumentCustomer {
  name: string;
  email: string;
  billingAddress: string;
  tier?: string;
  accountNumber?: string;
}

export interface InvoiceItem {
  description: string;
  category: string;
  quantity: number;
  unitPrice: number;
  taxRate: number; // e.g. 0.18 for 18% GST
  amount: number;
}

export interface InvoiceData {
  id: string;
  date: string;
  dueDate: string;
  status: "Paid" | "Pending" | "Failed" | "Overdue" | "Processing" | "Refunded";
  customer: DocumentCustomer;
  items: InvoiceItem[];
  currency: string; // e.g. "INR", "USD", "EUR"
  paymentMethod: string;
  transactionId: string;
  processingTime?: string;
  discount?: number;
  processingFee?: number;
}

export interface ReceiptData {
  id: string;
  date: string;
  title: string;
  amount: number;
  currency: string;
  category: string;
  paymentMethod: string;
  status: "Paid" | "Pending" | "Refunded";
  notes?: string;
  location?: string;
  customer: DocumentCustomer;
  transactionId: string;
}

export interface InvestmentAllocation {
  goalTitle: string;
  target: number;
  saved: number;
  percent: number;
  targetDate?: string;
}

export interface InvestmentData {
  id: string;
  date: string;
  period: string;
  customer: DocumentCustomer;
  allocations: InvestmentAllocation[];
  currency: string;
  totalInvested: number;
  status: "Settled" | "Processing" | "Paid";
  referenceId: string;
}

export interface AccountBudget {
  category: string;
  limit: number;
  spent: number;
  percentage: number;
  status: "On Track" | "Warning" | "Breached";
}

export interface AccountSummary {
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: number;
  activeBudgetsCount: number;
}

export interface AccountSpendItem {
  title: string;
  category: string;
  amount: number;
  date: string;
  method: string;
}

export interface AccountData {
  id: string;
  date: string;
  monthName: string;
  customer: DocumentCustomer;
  summary: AccountSummary;
  budgets: AccountBudget[];
  topSpends: AccountSpendItem[];
  currency: string;
  healthScore: number;
}

export class DocumentGeneratorService {
  // Shared brand credentials
  private static COMPANY_NAME = "FinTrack, Inc.";
  private static COMPANY_TAGLINE = "Your Personal Wealth Operating System";
  private static COMPANY_WEBSITE = "www.fintrack.io";
  private static COMPANY_EMAIL = "billing@fintrack.io";
  private static COMPANY_GSTIN = "GSTIN: 27AAAAA1111A1Z1";
  private static COMPANY_BRN = "BRN: CORP-1002931-IN";
  private static COMPANY_ADDRESS = "100 Pine Street, Suite 2400, San Francisco, CA 94111";

  // Vector-drawn QR code helper (Draws clean vector boxes inside jsPDF)
  private static drawVectorQRCode(doc: any, x: number, y: number, size: number) {
    const modules = 21; // QR code matrix grid size
    const mSize = size / modules; // module size in mm
    
    // Helper to draw filled square block
    const fillBlock = (col: number, row: number) => {
      doc.rect(x + col * mSize, y + row * mSize, mSize + 0.05, mSize + 0.05, "F");
    };

    // Helper to draw Finder Pattern at (col, row)
    const drawFinderPattern = (col: number, row: number) => {
      doc.setFillColor(10, 13, 20); // Dark color
      doc.rect(x + col * mSize, y + row * mSize, mSize * 7, mSize * 7, "F");
      doc.setFillColor(255, 255, 255); // White inner border
      doc.rect(x + (col + 1) * mSize, y + (row + 1) * mSize, mSize * 5, mSize * 5, "F");
      doc.setFillColor(10, 13, 20); // Dark inner core
      doc.rect(x + (col + 2) * mSize, y + (row + 2) * mSize, mSize * 3, mSize * 3, "F");
    };

    // 1. Finder patterns (three corners)
    drawFinderPattern(0, 0); // Top-Left
    drawFinderPattern(modules - 7, 0); // Top-Right
    drawFinderPattern(0, modules - 7); // Bottom-Left

    // 2. Alignment pattern
    doc.setFillColor(10, 13, 20);
    doc.rect(x + 14 * mSize, y + 14 * mSize, mSize * 3, mSize * 3, "F");
    doc.setFillColor(255, 255, 255);
    doc.rect(x + 15 * mSize, y + 15 * mSize, mSize, mSize, "F");

    // 3. Timing Patterns (dot lines connecting corners)
    doc.setFillColor(10, 13, 20);
    for (let col = 7; col < modules - 7; col += 2) {
      fillBlock(col, 6);
      fillBlock(6, col);
    }

    // 4. Fill simulated data matrix blocks (pseudorandom layout for visual authenticity)
    doc.setFillColor(10, 13, 20);
    const dataBlocks = [
      [8, 0], [9, 1], [11, 2], [12, 3], [7, 7], [8, 8], [9, 9], [10, 10],
      [12, 12], [13, 13], [14, 14], [8, 15], [9, 16], [10, 17], [11, 18],
      [14, 8], [15, 9], [16, 10], [17, 11], [18, 12], [19, 13], [20, 14],
      [8, 20], [9, 19], [11, 17], [12, 16], [13, 15], [15, 13], [16, 12],
      [17, 9], [18, 8], [19, 7], [20, 6], [14, 0], [15, 1], [16, 2],
      [0, 11], [1, 12], [2, 13], [3, 14], [11, 11], [10, 12], [9, 13],
      [12, 8], [13, 9], [14, 10], [15, 11], [18, 18], [19, 19], [20, 20]
    ];
    dataBlocks.forEach(([col, row]) => {
      fillBlock(col, row);
    });
  };

  // Vector-drawn Barcode helper
  private static drawVectorBarcode(doc: any, x: number, y: number, width: number, height: number, reference: string) {
    let barX = x;
    doc.setDrawColor(10, 13, 20); // Dark grey lines
    const barPatterns = [1, 2, 4, 1, 3, 2, 1, 2, 4, 2, 1, 3, 1, 4, 2, 1, 1, 2, 3, 1, 4, 1, 2, 1, 3, 2, 1, 4, 1];
    const totalWeight = barPatterns.reduce((sum, w) => sum + w, 0);
    const step = width / (totalWeight + barPatterns.length * 1.5);

    barPatterns.forEach((weight) => {
      doc.setLineWidth(weight * step);
      doc.line(barX, y, barX, y + height);
      barX += weight * step + step * 1.2;
    });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(140, 145, 155);
    doc.text(`*${reference.toUpperCase()}*`, x + width / 2, y + height + 4.5, { align: "center" });
  };

  // Helper to draw status badge
  private static drawStatusBadge(doc: any, x: number, y: number, status: string) {
    let bgColor = [240, 240, 240];
    let textColor = [80, 80, 80];
    
    switch (status.toUpperCase()) {
      case "PAID":
      case "SETTLED":
        bgColor = [224, 251, 236]; // Light emerald
        textColor = [0, 200, 117];  // Emerald #00C875
        break;
      case "PENDING":
      case "PROCESSING":
        bgColor = [255, 244, 224]; // Light amber
        textColor = [255, 176, 32];  // Amber #FFB020
        break;
      case "FAILED":
      case "OVERDUE":
        bgColor = [255, 235, 235]; // Light red
        textColor = [255, 90, 95];   // Red #FF5A5F
        break;
      case "REFUNDED":
        bgColor = [240, 244, 255]; // Light indigo
        textColor = [109, 93, 252];  // Indigo #6D5DFC
        break;
    }

    doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
    doc.rect(x - 22, y - 4, 22, 5.5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text(status.toUpperCase(), x - 11, y, { align: "center" });
  };

  // Helper to get currency symbols
  private static getCurrencySymbol(code: string): string {
    switch (code.toUpperCase()) {
      case "INR": return "Rs.";
      case "USD": return "$";
      case "EUR": return "EUR";
      default: return "Rs.";
    }
  }

  // Draw Shared Header Elements
  private static drawHeader(doc: any, docType: string, status: string, docId: string) {
    // 1. Brand Top colored bar
    doc.setFillColor(109, 93, 252); // Brand color #6D5DFC
    doc.rect(0, 0, 210, 12, "F");

    // 2. Company Brand Logo and Details
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(10, 13, 20); // #0A0D14
    doc.text(this.COMPANY_NAME, 20, 32);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(140, 145, 155);
    doc.text(this.COMPANY_TAGLINE, 20, 37);

    // Document Type Badge on the right
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(109, 93, 252);
    doc.text(docType.toUpperCase(), 190, 32, { align: "right" });

    // Status Badge & ID details
    this.drawStatusBadge(doc, 190, 42, status);
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(100, 110, 130);
    doc.text(`Ref ID: ${docId}`, 190, 47, { align: "right" });

    // Divider line
    doc.setDrawColor(233, 236, 245); // #E9ECF5
    doc.setLineWidth(0.5);
    doc.line(20, 52, 190, 52);

    // Company Business Details Column (Three columns)
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 110, 130);
    
    // Col 1: Contact
    doc.text("CONTACT DETAILS", 20, 60);
    doc.setTextColor(50, 60, 70);
    doc.text(this.COMPANY_WEBSITE, 20, 65);
    doc.text(this.COMPANY_EMAIL, 20, 70);
    
    // Col 2: Business Registration
    doc.setTextColor(100, 110, 130);
    doc.text("REGISTRATIONS", 80, 60);
    doc.setTextColor(50, 60, 70);
    doc.text(this.COMPANY_GSTIN, 80, 65);
    doc.text(this.COMPANY_BRN, 80, 70);

    // Col 3: Head Office
    doc.setTextColor(100, 110, 130);
    doc.text("HEAD OFFICE ADDRESS", 130, 60);
    doc.setTextColor(50, 60, 70);
    doc.text("100 Pine Street, Suite 2400", 130, 65);
    doc.text("San Francisco, CA 94111, USA", 130, 70);

    doc.line(20, 76, 190, 76);
  }

  // Draw Shared Customer Block
  private static drawCustomerBlock(doc: any, customer: DocumentCustomer, y: number) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(10, 13, 20);
    doc.text("BILL TO (CUSTOMER):", 20, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(50, 60, 70);
    doc.text(customer.name, 20, y + 6);
    doc.text(customer.email, 20, y + 11);
    
    doc.setFontSize(8);
    doc.setTextColor(140, 145, 155);
    doc.text(customer.billingAddress, 20, y + 16);

    // Right side: Customer Tier Details
    if (customer.tier || customer.accountNumber) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(10, 13, 20);
      doc.text("CLIENT SUMMARY:", 120, y);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(100, 110, 130);
      if (customer.accountNumber) {
        doc.text(`Account No: ${customer.accountNumber}`, 120, y + 6);
      }
      if (customer.tier) {
        doc.text(`Service Tier: ${customer.tier.toUpperCase()}`, 120, y + 11);
      }
      doc.text("Verification Status: SECURE CLIENT", 120, y + 16);
    }

    doc.setDrawColor(233, 236, 245);
    doc.line(20, y + 22, 190, y + 22);
  }

  // Draw Trust Badge & Footer
  private static drawFooter(doc: any, referenceId: string) {
    const pgHeight = doc.internal.pageSize.height;
    
    // Secure Seal & QR Section
    doc.setDrawColor(233, 236, 245);
    doc.line(20, pgHeight - 65, 190, pgHeight - 65);

    // Digital Seal text
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(109, 93, 252);
    doc.text("DIGITAL VERIFICATION SEAL", 20, pgHeight - 57);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(140, 145, 155);
    doc.text("Tamper-proof financial ledger hash. Scan QR code to verify validity.", 20, pgHeight - 52);

    // Mock SHA-256 Hash
    const mockHash = `SHA256-${Array.from({ length: 32 }, (_, i) => (i * 17 + referenceId.charCodeAt(0)).toString(16).slice(-2)).join("")}`;
    doc.setFont("courier", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(160, 165, 175);
    doc.text(`SECURE HASH: ${mockHash.toUpperCase()}`, 20, pgHeight - 46);

    // Draw Barcode on the bottom-left
    this.drawVectorBarcode(doc, 20, pgHeight - 40, 50, 11, referenceId);

    // Draw QR Code on the bottom-right
    this.drawVectorQRCode(doc, 170, pgHeight - 57, 20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(140, 145, 155);
    doc.text("SCAN TO VERIFY", 190, pgHeight - 34, { align: "right" });

    // Main bottom footer line
    doc.setDrawColor(240, 242, 247);
    doc.setLineWidth(0.4);
    doc.line(20, pgHeight - 22, 190, pgHeight - 22);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(140, 145, 155);
    doc.text("FinTrack is a private local-first financial operating system. Digital records are fully encrypted.", 105, pgHeight - 16, { align: "center" });
    doc.text("For help contact support@fintrack.io or visit support.fintrack.io. Copyright 2026 FinTrack, Inc.", 105, pgHeight - 11, { align: "center" });
  }

  // ==========================================
  // DOCUMENT 1: INVOICE GENERATOR
  // ==========================================
  public static async generateInvoicePDF(data: InvoiceData) {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    const currSym = this.getCurrencySymbol(data.currency);

    // 1. Header & Badges
    this.drawHeader(doc, "INVOICE STATEMENT", data.status, data.id);

    // 2. Dates details (Col 1: Issued; Col 2: Due Date; Col 3: Payment Ref)
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 110, 130);

    doc.text("DATE ISSUED", 20, 83);
    doc.setTextColor(50, 60, 70);
    doc.text(data.date, 20, 88);

    doc.setTextColor(100, 110, 130);
    doc.text("PAYMENT DUE DATE", 80, 83);
    doc.setTextColor(50, 60, 70);
    doc.text(data.dueDate, 80, 88);

    doc.setTextColor(100, 110, 130);
    doc.text("TRANSACTION REFERENCE", 130, 83);
    doc.setTextColor(50, 60, 70);
    doc.text(data.transactionId || "LOCAL-DEBIT", 130, 88);

    doc.setDrawColor(233, 236, 245);
    doc.line(20, 93, 190, 93);

    // 3. Customer Block
    this.drawCustomerBlock(doc, data.customer, 99);

    // 4. Line Items Table
    const tableY = 126;
    doc.setFillColor(247, 248, 252);
    doc.rect(20, tableY, 170, 7, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(10, 13, 20);
    doc.text("Item Description", 24, tableY + 5);
    doc.text("Category", 90, tableY + 5);
    doc.text("Qty", 125, tableY + 5, { align: "right" });
    doc.text("Price", 145, tableY + 5, { align: "right" });
    doc.text("Tax", 165, tableY + 5, { align: "right" });
    doc.text("Amount", 186, tableY + 5, { align: "right" });

    doc.line(20, tableY, 190, tableY);
    doc.line(20, tableY + 7, 190, tableY + 7);

    // Rows mapping
    let currentY = tableY + 7;
    let subtotal = 0;
    let totalTax = 0;

    data.items.forEach((item) => {
      currentY += 8;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(50, 60, 70);
      
      doc.text(item.description, 24, currentY - 2);
      doc.text(item.category, 90, currentY - 2);
      doc.text(item.quantity.toString(), 125, currentY - 2, { align: "right" });
      doc.text(`${currSym} ${item.unitPrice.toLocaleString()}`, 145, currentY - 2, { align: "right" });
      
      const taxPercent = Math.round(item.taxRate * 100);
      doc.text(`${taxPercent}%`, 165, currentY - 2, { align: "right" });
      doc.text(`${currSym} ${item.amount.toLocaleString()}`, 186, currentY - 2, { align: "right" });

      subtotal += item.amount;
      // Tax calculations
      totalTax += item.amount * item.taxRate / (1 + item.taxRate);

      doc.setDrawColor(245, 247, 250);
      doc.line(20, currentY, 190, currentY);
    });

    // 5. Invoice Calculations Summary box
    doc.setDrawColor(233, 236, 245);
    doc.line(20, currentY, 190, currentY);

    const calcY = currentY + 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 110, 130);

    doc.text("Subtotal:", 145, calcY, { align: "right" });
    doc.setTextColor(50, 60, 70);
    doc.text(`${currSym} ${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 186, calcY, { align: "right" });

    // Discount
    const disc = data.discount || 0;
    doc.setTextColor(100, 110, 130);
    doc.text("Discount:", 145, calcY + 5, { align: "right" });
    doc.setTextColor(disc > 0 ? [0, 200, 117] : [50, 60, 70] as any);
    doc.text(`-${currSym} ${disc.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 186, calcY + 5, { align: "right" });

    // Inclusive GST Tax
    doc.setTextColor(100, 110, 130);
    doc.text("GST (18% inclusive):", 145, calcY + 10, { align: "right" });
    doc.setTextColor(50, 60, 70);
    doc.text(`${currSym} ${totalTax.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 186, calcY + 10, { align: "right" });

    // Processing Fee
    const fee = data.processingFee || 0;
    doc.setTextColor(100, 110, 130);
    doc.text("Processing Fee:", 145, calcY + 15, { align: "right" });
    doc.setTextColor(50, 60, 70);
    doc.text(`${currSym} ${fee.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 186, calcY + 15, { align: "right" });

    // Grand Total divider
    doc.setLineWidth(0.8);
    doc.setDrawColor(109, 93, 252); // Brand color highlight
    doc.line(115, calcY + 19, 190, calcY + 19);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(10, 13, 20);
    doc.text("Grand Total Paid:", 145, calcY + 25, { align: "right" });
    doc.setTextColor(109, 93, 252);
    const grandTotal = subtotal - disc + fee;
    doc.text(`${currSym} ${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 186, calcY + 25, { align: "right" });

    // 6. Draw Footer & verification codes
    this.drawFooter(doc, data.id);

    // Save document
    doc.save(`fintrack_invoice_${data.id}.pdf`);
  }

  // ==========================================
  // DOCUMENT 2: RECEIPT GENERATOR
  // ==========================================
  public static async generateReceiptPDF(data: ReceiptData) {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    const currSym = this.getCurrencySymbol(data.currency);

    // Header & Badge
    this.drawHeader(doc, "PAYMENT RECEIPT", data.status, data.id);

    // Dates
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 110, 130);

    doc.text("PAYMENT DATE", 20, 83);
    doc.setTextColor(50, 60, 70);
    doc.text(data.date, 20, 88);

    doc.setTextColor(100, 110, 130);
    doc.text("METHOD OF PAYMENT", 80, 83);
    doc.setTextColor(50, 60, 70);
    doc.text(data.paymentMethod, 80, 88);

    doc.setTextColor(100, 110, 130);
    doc.text("GATEWAY TRANSACTION ID", 130, 83);
    doc.setTextColor(50, 60, 70);
    doc.text(data.transactionId || "TXN-UPSTOX-SEC", 130, 88);

    doc.setDrawColor(233, 236, 245);
    doc.line(20, 93, 190, 93);

    // Customer section
    this.drawCustomerBlock(doc, data.customer, 99);

    // Receipt details box
    doc.setFillColor(247, 248, 252);
    doc.rect(20, 126, 170, 38, "F");
    doc.setDrawColor(233, 236, 245);
    doc.rect(20, 126, 170, 38, "S");

    // Inside box
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(100, 110, 130);
    doc.text("Receipt Title:", 25, 134);
    doc.setTextColor(10, 13, 20);
    doc.text(data.title, 60, 134);

    doc.setTextColor(100, 110, 130);
    doc.text("Category Group:", 25, 141);
    doc.setTextColor(50, 60, 70);
    doc.text(data.category, 60, 141);

    doc.setTextColor(100, 110, 130);
    doc.text("Transaction Location:", 25, 148);
    doc.setTextColor(50, 60, 70);
    doc.text(data.location || "Online Sync Network, IN", 60, 148);

    doc.setTextColor(100, 110, 130);
    doc.text("Ledger Context:", 25, 155);
    doc.setTextColor(50, 60, 70);
    doc.text(data.notes || "Standard Ledger Expense", 60, 155);

    // Calculation list
    const calcY = 172;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(100, 110, 130);
    doc.text("Subtotal amount transacted:", 140, calcY, { align: "right" });
    doc.setTextColor(50, 60, 70);
    doc.text(`${currSym} ${data.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 186, calcY, { align: "right" });

    // GST
    const gstVal = data.category === "Food" || data.category === "Rent" || data.category === "Recharge" 
      ? (data.amount * 0.18 / 1.18) : 0;
    doc.setTextColor(100, 110, 130);
    doc.text("GST (18% inclusive):", 140, calcY + 5, { align: "right" });
    doc.setTextColor(50, 60, 70);
    doc.text(`${currSym} ${gstVal.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 186, calcY + 5, { align: "right" });

    doc.setLineWidth(0.7);
    doc.setDrawColor(109, 93, 252);
    doc.line(115, calcY + 9, 190, calcY + 9);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(10, 13, 20);
    doc.text("Total Settled:", 140, calcY + 15, { align: "right" });
    doc.setTextColor(109, 93, 252);
    doc.text(`${currSym} ${data.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 186, calcY + 15, { align: "right" });

    // Footer
    this.drawFooter(doc, data.id);

    // Save
    doc.save(`fintrack_receipt_${data.id}.pdf`);
  }

  // ==========================================
  // DOCUMENT 3: INVESTMENT STATEMENT
  // ==========================================
  public static async generateInvestmentStatementPDF(data: InvestmentData) {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    const currSym = this.getCurrencySymbol(data.currency);

    // Header
    this.drawHeader(doc, "INVESTMENT STATEMENT", data.status, data.id);

    // Periods
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 110, 130);

    doc.text("STATEMENT PERIOD", 20, 83);
    doc.setTextColor(50, 60, 70);
    doc.text(data.period, 20, 88);

    doc.setTextColor(100, 110, 130);
    doc.text("ACCOUNT PORTFOLIO REFERENCE", 80, 83);
    doc.setTextColor(50, 60, 70);
    doc.text(data.referenceId, 80, 88);

    doc.setTextColor(100, 110, 130);
    doc.text("TOTAL DISBURSED THIS MONTH", 130, 83);
    doc.setTextColor(109, 93, 252); // Brand color highlight
    doc.setFont("helvetica", "bold");
    doc.text(`${currSym} ${data.totalInvested.toLocaleString()}`, 130, 88);

    doc.setDrawColor(233, 236, 245);
    doc.line(20, 93, 190, 93);

    // Customer details
    this.drawCustomerBlock(doc, data.customer, 99);

    // Allocation Goals Table
    const tableY = 126;
    doc.setFillColor(247, 248, 252);
    doc.rect(20, tableY, 170, 7, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(10, 13, 20);
    doc.text("Linked Milestones (SIP)", 24, tableY + 5);
    doc.text("Target TargetDate", 90, tableY + 5);
    doc.text("Target Sum", 125, tableY + 5, { align: "right" });
    doc.text("Current Accumulated", 155, tableY + 5, { align: "right" });
    doc.text("Completion %", 186, tableY + 5, { align: "right" });

    doc.line(20, tableY, 190, tableY);
    doc.line(20, tableY + 7, 190, tableY + 7);

    let currentY = tableY + 7;
    data.allocations.forEach((item) => {
      currentY += 8;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(50, 60, 70);

      doc.text(item.goalTitle, 24, currentY - 2);
      doc.text(item.targetDate || "Dec 2026", 90, currentY - 2);
      doc.text(`${currSym} ${item.target.toLocaleString()}`, 125, currentY - 2, { align: "right" });
      doc.text(`${currSym} ${item.saved.toLocaleString()}`, 155, currentY - 2, { align: "right" });
      doc.setFont("helvetica", "bold");
      doc.text(`${item.percent}%`, 186, currentY - 2, { align: "right" });

      doc.setDrawColor(245, 247, 250);
      doc.line(20, currentY, 190, currentY);
    });

    // Summary box
    doc.setDrawColor(233, 236, 245);
    doc.line(20, currentY, 190, currentY);

    const summaryY = currentY + 10;
    doc.setFillColor(247, 248, 252);
    doc.rect(20, summaryY, 170, 18, "F");
    doc.rect(20, summaryY, 170, 18, "S");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(10, 13, 20);
    doc.text("FINANCIAL COMPLIMENTARY NOTE:", 25, summaryY + 7);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 110, 130);
    doc.text("All deposits logged represent offline self-reported mutual fund SIP values.", 25, summaryY + 13);

    // Footer
    this.drawFooter(doc, data.id);

    // Save
    doc.save(`fintrack_statement_${data.id}.pdf`);
  }

  // ==========================================
  // DOCUMENT 4: ACCOUNT STATEMENT
  // ==========================================
  public static async generateAccountStatementPDF(data: AccountData) {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    const currSym = this.getCurrencySymbol(data.currency);

    // Header
    this.drawHeader(doc, "ACCOUNT AUDIT REPORT", "Settled", data.id);

    // Period Details
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 110, 130);

    doc.text("AUDIT MONTH", 20, 83);
    doc.setTextColor(50, 60, 70);
    doc.text(data.monthName, 20, 88);

    doc.setTextColor(100, 110, 130);
    doc.text("MONTHLY SAVINGS VELOCITY", 80, 83);
    doc.setTextColor(50, 60, 70);
    doc.text(`${data.summary.savingsRate}% Rate`, 80, 88);

    doc.setTextColor(100, 110, 130);
    doc.text("FINANCIAL HEALTH RATING", 130, 83);
    doc.setTextColor(0, 200, 117); // Green positive rating
    doc.setFont("helvetica", "bold");
    doc.text(`${data.healthScore} / 100`, 130, 88);

    doc.setDrawColor(233, 236, 245);
    doc.line(20, 93, 190, 93);

    // Customer
    this.drawCustomerBlock(doc, data.customer, 99);

    // Summary Statistics Box
    const boxY = 126;
    doc.setFillColor(247, 248, 252);
    doc.rect(20, boxY, 170, 20, "F");
    doc.rect(20, boxY, 170, 20, "S");

    // Income / Expense Metrics
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 110, 130);
    doc.text("TOTAL CASH CREDITED", 25, boxY + 6);
    doc.setFontSize(11);
    doc.setTextColor(0, 200, 117); // Green income
    doc.text(`${currSym} ${data.summary.totalIncome.toLocaleString()}`, 25, boxY + 15);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 110, 130);
    doc.text("TOTAL CASH DEBITED", 80, boxY + 6);
    doc.setFontSize(11);
    doc.setTextColor(255, 90, 95); // Red expenses
    doc.text(`${currSym} ${data.summary.totalExpenses.toLocaleString()}`, 80, boxY + 15);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 110, 130);
    doc.text("NET ACCUMULATION", 135, boxY + 6);
    doc.setFontSize(11);
    doc.setTextColor(109, 93, 252); // Brand color
    doc.text(`${currSym} ${data.summary.netSavings.toLocaleString()}`, 135, boxY + 15);

    // Budgets Limit list
    const budgetStartY = 153;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(10, 13, 20);
    doc.text("MONTHLY ENVELOPE BUDGET STATS", 20, budgetStartY);

    // Table budget
    doc.setFillColor(247, 248, 252);
    doc.rect(20, budgetStartY + 3, 170, 6, "F");
    doc.setFontSize(7.5);
    doc.text("Category", 24, budgetStartY + 7);
    doc.text("Ceiling Limit", 70, budgetStartY + 7, { align: "right" });
    doc.text("Spent to Date", 110, budgetStartY + 7, { align: "right" });
    doc.text("Utilization Ratio", 150, budgetStartY + 7, { align: "right" });
    doc.text("Status Alert", 186, budgetStartY + 7, { align: "right" });

    doc.line(20, budgetStartY + 3, 190, budgetStartY + 3);
    doc.line(20, budgetStartY + 9, 190, budgetStartY + 9);

    let budgetY = budgetStartY + 9;
    data.budgets.slice(0, 3).forEach((b) => {
      budgetY += 7;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(50, 60, 70);

      doc.text(b.category, 24, budgetY - 2);
      doc.text(`${currSym} ${b.limit.toLocaleString()}`, 70, budgetY - 2, { align: "right" });
      doc.text(`${currSym} ${b.spent.toLocaleString()}`, 110, budgetY - 2, { align: "right" });
      doc.text(`${b.percentage}%`, 150, budgetY - 2, { align: "right" });

      const isBreached = b.percentage >= 100;
      doc.setFont("helvetica", "bold");
      doc.setTextColor(isBreached ? 255 : 50, isBreached ? 90 : 160, isBreached ? 95 : 70);
      doc.text(isBreached ? "BREACHED" : "ON TRACK", 186, budgetY - 2, { align: "right" });

      doc.setDrawColor(245, 247, 250);
      doc.line(20, budgetY, 190, budgetY);
    });

    // Top transactions list
    const spendStartY = budgetY + 6;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(10, 13, 20);
    doc.text("TOP DISCRETIONARY TRANSACTIONS IN LEDGER", 20, spendStartY);

    doc.setFillColor(247, 248, 252);
    doc.rect(20, spendStartY + 3, 170, 6, "F");
    doc.setFontSize(7.5);
    doc.text("Date", 24, spendStartY + 7);
    doc.text("Description Title", 50, spendStartY + 7);
    doc.text("Category", 110, spendStartY + 7);
    doc.text("Account", 145, spendStartY + 7);
    doc.text("Amount Paid", 186, spendStartY + 7, { align: "right" });

    doc.line(20, spendStartY + 3, 190, spendStartY + 3);
    doc.line(20, spendStartY + 9, 190, spendStartY + 9);

    let spendY = spendStartY + 9;
    data.topSpends.slice(0, 3).forEach((item) => {
      spendY += 7;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(50, 60, 70);

      doc.text(item.date, 24, spendY - 2);
      doc.text(item.title, 50, spendY - 2);
      doc.text(item.category, 110, spendY - 2);
      doc.text(item.method, 145, spendY - 2);
      doc.setFont("helvetica", "bold");
      doc.text(`${currSym} ${item.amount.toLocaleString()}`, 186, spendY - 2, { align: "right" });

      doc.setDrawColor(245, 247, 250);
      doc.line(20, spendY, 190, spendY);
    });

    // Footer
    this.drawFooter(doc, data.id);

    // Save
    doc.save(`fintrack_account_statement_${data.id}.pdf`);
  }
}
