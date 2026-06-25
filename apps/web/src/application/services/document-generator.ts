import { Money } from "../../domain/value-objects/money";

export interface DocumentCustomer {
  name: string;
  email: string;
  billingAddress: string;
  tier?: string;
  accountNumber?: string;
  customerId?: string;
  country?: string;
  taxRegion?: string;
}

export interface InvoiceItem {
  description: string;
  category: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  amount: number;
  note?: string;
}

export interface InvoiceData {
  id: string;
  date: string;
  dueDate: string;
  status: "Paid" | "Pending" | "Failed" | "Overdue" | "Processing" | "Refunded";
  customer: DocumentCustomer;
  items: InvoiceItem[];
  currency: string;
  paymentMethod: string;
  transactionId: string;
  processingTime?: string;
  discount?: number;
  processingFee?: number;
  referenceNumber?: string;
  poReference?: string;
  paymentTerms?: string;
  billingPeriod?: string;
  invoiceType?: string;
  placeOfSupply?: string;
  paymentGateway?: string;
  paymentTimestamp?: string;
  note?: string;
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

// ─── Brand Tokens ────────────────────────────────────────────────────────────
const BRAND = {
  COMPANY_NAME: "FinTrack Technologies Pvt. Ltd.",
  WORDMARK: "FinTrack",
  COMPANY_TAGLINE: "Smart Finance. Simplified.",
  COMPANY_WEBSITE: "www.fintrack.io",
  COMPANY_EMAIL: "support@fintrack.io",
  COMPANY_SUPPORT: "support@fintrack.io",
  COMPANY_PHONE: "+91 40 1234 5678",
  COMPANY_GSTIN: "36AABCF1234A1Z5",
  COMPANY_BRN: "U72900TG2021PTC154321",
  COMPANY_CIN: "U72900TG2021PTC154321",
  COMPANY_ADDRESS_1: "401, Skyline Tower, Financial District,",
  COMPANY_ADDRESS_2: "Gachibowli, Hyderabad, Telangana 500032, India",
  COLOR_PRIMARY: [109, 93, 252] as [number, number, number],
  COLOR_SUCCESS: [0, 170, 110] as [number, number, number],
  COLOR_WARNING: [217, 119, 6] as [number, number, number],
  COLOR_DANGER: [220, 38, 38] as [number, number, number],
  COLOR_REFUND: [109, 93, 252] as [number, number, number],
  COLOR_INK: [10, 13, 20] as [number, number, number],
  COLOR_MUTED: [100, 110, 130] as [number, number, number],
  COLOR_LIGHT: [140, 145, 155] as [number, number, number],
  COLOR_BODY: [50, 60, 75] as [number, number, number],
  COLOR_BG: [247, 248, 252] as [number, number, number],
  COLOR_BORDER: [228, 231, 240] as [number, number, number],
  COLOR_WHITE: [255, 255, 255] as [number, number, number],
};

// Static font assets used so the ₹ glyph renders correctly (jsPDF's built-in
// fonts have no Indian Rupee glyph). Fetched once and cached in-memory.
const FONT_REGULAR_URL = "https://raw.githubusercontent.com/google/fonts/main/ofl/lato/Lato-Regular.ttf";
const FONT_BOLD_URL = "https://raw.githubusercontent.com/google/fonts/main/ofl/lato/Lato-Bold.ttf";

export class DocumentGeneratorService {
  static COMPANY_NAME = BRAND.COMPANY_NAME;
  static COMPANY_TAGLINE = BRAND.COMPANY_TAGLINE;
  static COMPANY_WEBSITE = BRAND.COMPANY_WEBSITE;
  static COMPANY_EMAIL = BRAND.COMPANY_EMAIL;
  static COMPANY_GSTIN = `GSTIN: ${BRAND.COMPANY_GSTIN}`;
  static COMPANY_BRN = `CIN: ${BRAND.COMPANY_CIN}`;
  static COMPANY_ADDRESS = `${BRAND.COMPANY_ADDRESS_1}, ${BRAND.COMPANY_ADDRESS_2}`;

  // Cached base64 font data so we only fetch once per session.
  private static fontCache: { regular?: string; bold?: string; failed?: boolean } = {};

  private static async arrayBufferToBase64(buffer: ArrayBuffer): Promise<string> {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    const chunk = 8192;
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
    }
    return btoa(binary);
  }

  // Registers a Unicode-capable font (Lato) on the given jsPDF doc so the ₹
  // glyph renders correctly. jsPDF's built-in fonts can't render ₹ at all.
  // Falls back gracefully (returns false) if the fetch fails, e.g. offline.
  private static async registerRupeeFont(doc: any): Promise<boolean> {
    if (this.fontCache.failed) return false;
    try {
      if (!this.fontCache.regular || !this.fontCache.bold) {
        const [regRes, boldRes] = await Promise.all([
          fetch(FONT_REGULAR_URL), fetch(FONT_BOLD_URL),
        ]);
        if (!regRes.ok || !boldRes.ok) throw new Error("font fetch failed");
        const [regBuf, boldBuf] = await Promise.all([regRes.arrayBuffer(), boldRes.arrayBuffer()]);
        this.fontCache.regular = await this.arrayBufferToBase64(regBuf);
        this.fontCache.bold = await this.arrayBufferToBase64(boldBuf);
      }
      doc.addFileToVFS("Lato-Regular.ttf", this.fontCache.regular);
      doc.addFont("Lato-Regular.ttf", "Lato", "normal");
      doc.addFileToVFS("Lato-Bold.ttf", this.fontCache.bold);
      doc.addFont("Lato-Bold.ttf", "Lato", "bold");
      doc.setFont("Lato", "normal");
      return true;
    } catch {
      this.fontCache.failed = true;
      return false;
    }
  }

  private static sym(code: string, rupeeGlyphReady: boolean = true): string {
    switch (code.toUpperCase()) {
      case "INR": return rupeeGlyphReady ? "₹" : "Rs. ";
      case "USD": return "$";
      case "EUR": return "€";
      default: return "₹";
    }
  }

  private static fmt(n: number, sym: string): string {
    return `${sym}${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  private static statusColor(status: string): [number, number, number] {
    switch (status.toUpperCase()) {
      case "PAID": case "SETTLED": return BRAND.COLOR_SUCCESS;
      case "PENDING": case "PROCESSING": return BRAND.COLOR_WARNING;
      case "FAILED": case "OVERDUE": return BRAND.COLOR_DANGER;
      case "REFUNDED": return BRAND.COLOR_REFUND;
      default: return BRAND.COLOR_MUTED;
    }
  }

  private static statusBg(status: string): [number, number, number] {
    switch (status.toUpperCase()) {
      case "PAID": case "SETTLED": return [224, 251, 236];
      case "PENDING": case "PROCESSING": return [255, 244, 224];
      case "FAILED": case "OVERDUE": return [255, 235, 235];
      case "REFUNDED": return [240, 240, 255];
      default: return [240, 240, 240];
    }
  }

  private static drawQR(doc: any, x: number, y: number, size: number) {
    const M = 21;
    const s = size / M;
    const blk = (c: number, r: number) =>
      doc.rect(x + c * s, y + r * s, s + 0.04, s + 0.04, "F");

    const finder = (cx: number, ry: number) => {
      doc.setFillColor(...BRAND.COLOR_INK);
      doc.rect(x + cx * s, y + ry * s, s * 7, s * 7, "F");
      doc.setFillColor(...BRAND.COLOR_WHITE);
      doc.rect(x + (cx + 1) * s, y + (ry + 1) * s, s * 5, s * 5, "F");
      doc.setFillColor(...BRAND.COLOR_INK);
      doc.rect(x + (cx + 2) * s, y + (ry + 2) * s, s * 3, s * 3, "F");
    };

    finder(0, 0); finder(M - 7, 0); finder(0, M - 7);

    doc.setFillColor(...BRAND.COLOR_INK);
    doc.rect(x + 14 * s, y + 14 * s, s * 3, s * 3, "F");
    doc.setFillColor(...BRAND.COLOR_WHITE);
    doc.rect(x + 15 * s, y + 15 * s, s, s, "F");

    doc.setFillColor(...BRAND.COLOR_INK);
    for (let i = 7; i < M - 7; i += 2) { blk(i, 6); blk(6, i); }

    const data = [
      [8,0],[9,1],[11,2],[12,3],[7,7],[8,8],[9,9],[10,10],[12,12],[13,13],[14,14],
      [8,15],[9,16],[10,17],[11,18],[14,8],[15,9],[16,10],[17,11],[18,12],[19,13],
      [20,14],[8,20],[9,19],[11,17],[12,16],[13,15],[15,13],[16,12],[17,9],[18,8],
      [19,7],[20,6],[14,0],[15,1],[16,2],[0,11],[1,12],[2,13],[3,14],[11,11],
      [10,12],[9,13],[12,8],[13,9],[14,10],[15,11],[18,18],[19,19],[20,20],
    ];
    data.forEach(([c, r]) => blk(c, r));
  }

  private static drawBarcode(doc: any, x: number, y: number, w: number, h: number, ref: string) {
    const patterns = [1,2,4,1,3,2,1,2,4,2,1,3,1,4,2,1,1,2,3,1,4,1,2,1,3,2,1,4,1];
    const total = patterns.reduce((s, v) => s + v, 0) + patterns.length * 1.5;
    const step = w / total;
    let bx = x;
    doc.setDrawColor(...BRAND.COLOR_INK);
    patterns.forEach((wt) => {
      doc.setLineWidth(wt * step);
      doc.line(bx, y, bx, y + h);
      bx += wt * step + step * 1.2;
    });
    doc.setFont("courier", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...BRAND.COLOR_LIGHT);
    doc.text(`*${ref.toUpperCase().slice(0, 12)}*`, x + w / 2, y + h + 4, { align: "center" });
  }

  private static drawHeader(doc: any, type: string, status: string, id: string, accentRgb: [number, number, number] = BRAND.COLOR_PRIMARY) {
    doc.setFillColor(...accentRgb);
    doc.rect(0, 0, 210, 10, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(...BRAND.COLOR_INK);
    doc.text(BRAND.COMPANY_NAME, 20, 30);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...BRAND.COLOR_LIGHT);
    doc.text(BRAND.COMPANY_TAGLINE.toUpperCase(), 20, 36);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...accentRgb);
    doc.text(type, 190, 28, { align: "right" });

    const sc = this.statusColor(status);
    const sb = this.statusBg(status);
    doc.setFillColor(...sb);
    doc.roundedRect(168, 31, 22, 6, 1.5, 1.5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...sc);
    doc.text(status.toUpperCase(), 179, 35.5, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...BRAND.COLOR_MUTED);
    doc.text(id, 190, 42, { align: "right" });

    doc.setDrawColor(...BRAND.COLOR_BORDER);
    doc.setLineWidth(0.4);
    doc.line(20, 48, 190, 48);

    const cols = [
      { label: "CONTACT", lines: [BRAND.COMPANY_WEBSITE, BRAND.COMPANY_EMAIL] },
      { label: "REGISTRATIONS", lines: [`GSTIN: ${BRAND.COMPANY_GSTIN}`, `BRN: ${BRAND.COMPANY_BRN}`] },
      { label: "REGISTERED OFFICE", lines: [BRAND.COMPANY_ADDRESS_1, BRAND.COMPANY_ADDRESS_2] },
    ];
    const xs = [20, 80, 135];
    cols.forEach((col, i) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(...BRAND.COLOR_LIGHT);
      doc.text(col.label, xs[i], 55);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...BRAND.COLOR_BODY);
      col.lines.forEach((line, j) => doc.text(line, xs[i], 61 + j * 5));
    });

    doc.setLineWidth(0.3);
    doc.line(20, 74, 190, 74);
  }

  private static drawCustomer(doc: any, customer: DocumentCustomer, y: number) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...BRAND.COLOR_LIGHT);
    doc.text("BILL TO", 20, y);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...BRAND.COLOR_INK);
    doc.text(customer.name, 20, y + 6);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...BRAND.COLOR_BODY);
    doc.text(customer.email, 20, y + 12);

    doc.setFontSize(7.5);
    doc.setTextColor(...BRAND.COLOR_MUTED);
    const addrLines = doc.splitTextToSize(customer.billingAddress, 75);
    addrLines.forEach((line: string, i: number) => doc.text(line, 20, y + 18 + i * 4.5));

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...BRAND.COLOR_LIGHT);
    doc.text("ACCOUNT DETAILS", 120, y);

    const details = [
      customer.customerId ? ["Customer ID", customer.customerId] : null,
      customer.accountNumber ? ["Account No.", customer.accountNumber] : null,
      customer.tier ? ["Membership Tier", customer.tier.toUpperCase()] : null,
      customer.taxRegion ? ["Tax Region", customer.taxRegion] : null,
      ["Verification", "SECURE CLIENT"],
    ].filter(Boolean) as [string, string][];

    details.forEach(([label, value], i) => {
      const ly = y + 6 + i * 5.5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(...BRAND.COLOR_MUTED);
      doc.text(label, 120, ly);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...(value.includes("SECURE") ? BRAND.COLOR_SUCCESS : BRAND.COLOR_BODY));
      doc.text(value, 175, ly, { align: "right" });
    });

    doc.setLineWidth(0.3);
    doc.setDrawColor(...BRAND.COLOR_BORDER);
    doc.line(20, y + 32, 190, y + 32);
  }

  private static drawMetaRow(doc: any, y: number, cols: { label: string; value: string }[]) {
    const xs = [20, 80, 135];
    cols.forEach((col, i) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(...BRAND.COLOR_LIGHT);
      doc.text(col.label.toUpperCase(), xs[i], y);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(...BRAND.COLOR_BODY);
      doc.text(col.value, xs[i], y + 5);
    });
    doc.setLineWidth(0.3);
    doc.setDrawColor(...BRAND.COLOR_BORDER);
    doc.line(20, y + 10, 190, y + 10);
  }

  private static sectionLabel(doc: any, text: string, y: number) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...BRAND.COLOR_LIGHT);
    doc.text(text.toUpperCase(), 20, y);
  }

  private static drawTableHeader(doc: any, y: number, cols: { label: string; x: number; align?: "left" | "right" }[]) {
    doc.setFillColor(...BRAND.COLOR_BG);
    doc.rect(20, y - 0.5, 170, 7.5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...BRAND.COLOR_INK);
    cols.forEach(col => {
      const opts = col.align === "right" ? { align: "right" } : {};
      doc.text(col.label, col.x, y + 4.5, opts);
    });
    doc.setDrawColor(...BRAND.COLOR_BORDER);
    doc.setLineWidth(0.3);
    doc.line(20, y - 0.5, 190, y - 0.5);
    doc.line(20, y + 7, 190, y + 7);
  }

  private static drawTotals(doc: any, y: number, rows: { label: string; value: string; bold?: boolean; accent?: boolean; line?: boolean }[], accentRgb: [number, number, number] = BRAND.COLOR_PRIMARY) {
    rows.forEach(row => {
      if (row.line) {
        doc.setDrawColor(...accentRgb);
        doc.setLineWidth(0.5);
        doc.line(120, y - 1, 190, y - 1);
        y += 2;
      }
      doc.setFont("helvetica", row.bold ? "bold" : "normal");
      doc.setFontSize(row.bold ? 10 : 8);
      doc.setTextColor(...(row.accent ? accentRgb : row.bold ? BRAND.COLOR_INK : BRAND.COLOR_MUTED));
      doc.text(row.label, 148, y, { align: "right" });
      doc.setFont("helvetica", row.bold ? "bold" : "normal");
      doc.setTextColor(...(row.accent ? accentRgb : row.bold ? BRAND.COLOR_INK : BRAND.COLOR_BODY));
      doc.text(row.value, 188, y, { align: "right" });
      y += row.bold ? 7 : 5.5;
    });
  }

  private static drawFooter(doc: any, refId: string, accentRgb: [number, number, number] = BRAND.COLOR_PRIMARY) {
    const ph = doc.internal.pageSize.height;

    doc.setLineWidth(0.3);
    doc.setDrawColor(...BRAND.COLOR_BORDER);
    doc.line(20, ph - 62, 190, ph - 62);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...accentRgb);
    doc.text("DOCUMENT VERIFICATION", 20, ph - 55);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...BRAND.COLOR_MUTED);
    doc.text("This document is digitally signed and tamper-evident. Scan QR code to verify authenticity.", 20, ph - 50);
    doc.text(`Verification URL: verify.fintrack.io/${refId.toLowerCase()}`, 20, ph - 45);

    const hash = `sha256-${refId.replace(/[^a-z0-9]/gi, "").toLowerCase().padEnd(32, "0").slice(0, 32)}`;
    doc.setFont("courier", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(...BRAND.COLOR_LIGHT);
    doc.text(`INTEGRITY: ${hash.toUpperCase()}`, 20, ph - 40);

    this.drawBarcode(doc, 20, ph - 35, 55, 10, refId);
    this.drawQR(doc, 168, ph - 58, 22);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(...BRAND.COLOR_LIGHT);
    doc.text("SCAN TO VERIFY", 179, ph - 33, { align: "center" });

    doc.setFillColor(...BRAND.COLOR_BG);
    doc.rect(0, ph - 20, 210, 20, "F");
    doc.setLineWidth(0.3);
    doc.setDrawColor(...BRAND.COLOR_BORDER);
    doc.line(20, ph - 20, 190, ph - 20);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...BRAND.COLOR_LIGHT);
    doc.text(`${BRAND.COMPANY_NAME}  ·  ${BRAND.COMPANY_WEBSITE}  ·  ${BRAND.COMPANY_SUPPORT}`, 105, ph - 13, { align: "center" });
    doc.text("Computer-generated document. No physical signature required.  ·  © 2026 FinTrack, Inc. All rights reserved.", 105, ph - 8, { align: "center" });
  }


  // ══════════════════════════════════════════════════════════════════════════
  // INVOICE  (pro layout – matches reference design)
  // ══════════════════════════════════════════════════════════════════════════

  private static paymentMeta(status: string): {
    banner: string; bannerSub: string; amountLabel: string;
    subtitle: (date: string, due?: string) => string; pill: string;
  } {
    const s = status.toUpperCase();
    switch (s) {
      case "PAID": case "SETTLED":
        return { banner: "PAID IN FULL", bannerSub: "No outstanding balance", amountLabel: "Amount Paid", subtitle: (date) => `Paid on ${date}`, pill: "SUCCESS" };
      case "PENDING": case "PROCESSING":
        return { banner: "PAYMENT PENDING", bannerSub: "Awaiting confirmation", amountLabel: "Amount Due", subtitle: (_date, due) => `Due on ${due ?? ""}`, pill: "PENDING" };
      case "FAILED":
        return { banner: "PAYMENT FAILED", bannerSub: "Please retry or contact support", amountLabel: "Amount Due", subtitle: () => "Action required", pill: "FAILED" };
      case "OVERDUE":
        return { banner: "PAYMENT OVERDUE", bannerSub: "Please settle immediately", amountLabel: "Amount Due", subtitle: (_date, due) => `Was due ${due ?? ""}`, pill: "OVERDUE" };
      case "REFUNDED":
        return { banner: "REFUNDED", bannerSub: "Amount returned to source", amountLabel: "Amount Refunded", subtitle: (date) => `Refunded on ${date}`, pill: "REFUNDED" };
      default:
        return { banner: s, bannerSub: "", amountLabel: "Amount Due", subtitle: (date) => date, pill: s };
    }
  }

  private static checkIcon(doc: any, x: number, y: number, size: number, color: [number, number, number]) {
    doc.setDrawColor(...color);
    doc.setLineWidth(size * 0.16);
    doc.lines(
      [[size * 0.32, size * 0.32], [size * 0.55, -size * 0.62]],
      x, y + size * 0.42,
      [1, 1], "S"
    );
  }

  private static proCard(doc: any, x: number, y: number, w: number, h: number) {
    doc.setFillColor(...BRAND.COLOR_BG);
    doc.roundedRect(x, y, w, h, 2.2, 2.2, "F");
    doc.setDrawColor(...BRAND.COLOR_BORDER);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, y, w, h, 2.2, 2.2, "S");
  }

  private static proRow(
    doc: any, label: string, value: string,
    x1: number, x2: number, y: number,
    opts: { bold?: boolean; size?: number; color?: [number, number, number] } = {}
  ) {
    doc.setFont("Lato", "normal");
    doc.setFontSize(7.3);
    doc.setTextColor(...BRAND.COLOR_MUTED);
    doc.text(label, x1, y);
    doc.setFont("Lato", opts.bold ? "bold" : "normal");
    doc.setFontSize(opts.size ?? 8);
    doc.setTextColor(...(opts.color ?? BRAND.COLOR_BODY));
    doc.text(value, x2, y, { align: "right" });
  }

  public static async generateInvoicePDF(data: InvoiceData, accentRgb: [number, number, number] = BRAND.COLOR_PRIMARY) {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    await this.registerRupeeFont(doc);
    const S = this.sym(data.currency);

    const LX = 20, RX = 190, CW = 170;
    const ph = doc.internal.pageSize.height;
    const pmeta = this.paymentMeta(data.status);

    // ── top accent bar ────────────────────────────────────────────────────
    doc.setFillColor(...accentRgb);
    doc.rect(0, 0, 210, 3.2, "F");

    // ── logo lockup ───────────────────────────────────────────────────────
    doc.setFillColor(...accentRgb);
    doc.roundedRect(LX, 10, 9, 9, 2, 2, "F");
    doc.setFillColor(255, 255, 255);
    doc.triangle(LX + 2.3, 12.2, LX + 2.3, 16.8, LX + 7, 14.5, "F");

    doc.setFont("Lato", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...BRAND.COLOR_INK);
    doc.text(BRAND.WORDMARK, LX + 12, 16.5);
    doc.setFont("Lato", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(...BRAND.COLOR_LIGHT);
    doc.text(BRAND.COMPANY_TAGLINE, LX + 12, 20.3);

    // ── company block ─────────────────────────────────────────────────────
    doc.setFont("Lato", "bold");
    doc.setFontSize(8.8);
    doc.setTextColor(...BRAND.COLOR_INK);
    doc.text(BRAND.COMPANY_NAME, LX, 30);

    doc.setFont("Lato", "normal");
    doc.setFontSize(7.3);
    doc.setTextColor(...BRAND.COLOR_MUTED);
    doc.text(BRAND.COMPANY_ADDRESS_1, LX, 35);
    doc.text(BRAND.COMPANY_ADDRESS_2, LX, 39.2);
    doc.text(BRAND.COMPANY_WEBSITE, LX, 45);
    doc.text(BRAND.COMPANY_EMAIL, LX, 49.2);

    doc.setFont("Lato", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...BRAND.COLOR_BODY);
    doc.text(`GSTIN: ${BRAND.COMPANY_GSTIN}`, LX, 55);
    doc.text(`CIN: ${BRAND.COMPANY_CIN}`, LX, 59.2);

    // ── right: badge + invoice number + meta rows ─────────────────────────
    doc.setFillColor(...accentRgb);
    doc.roundedRect(RX - 26, 11, 26, 6.5, 1.6, 1.6, "F");
    doc.setFont("Lato", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    doc.text("INVOICE", RX - 13, 15.4, { align: "center" });

    doc.setFont("Lato", "bold");
    doc.setFontSize(15);
    doc.setTextColor(...BRAND.COLOR_INK);
    doc.text(data.id, RX, 25, { align: "right" });

    const metaRows: [string, string][] = [
      ["Issue Date", data.date],
      ["Due Date", data.dueDate],
      ["Currency", `${data.currency} (${S})`],
      ["Place of Supply", data.placeOfSupply ?? "Telangana (36)"],
    ];
    let my = 31.5;
    metaRows.forEach(([l, v]) => {
      doc.setFont("Lato", "normal");
      doc.setFontSize(7.3);
      doc.setTextColor(...BRAND.COLOR_MUTED);
      doc.text(l, 138, my);
      doc.setFont("Lato", "bold");
      doc.setFontSize(7.8);
      doc.setTextColor(...BRAND.COLOR_BODY);
      doc.text(v, RX, my, { align: "right" });
      my += 4.6;
    });

    // ── status card ───────────────────────────────────────────────────────
    const stY = my + 1.5;
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(138, stY, 52, 16.5, 2, 2, "F");
    doc.setDrawColor(...BRAND.COLOR_BORDER);
    doc.setLineWidth(0.3);
    doc.roundedRect(138, stY, 52, 16.5, 2, 2, "S");
    doc.setFont("Lato", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...BRAND.COLOR_LIGHT);
    doc.text("STATUS", 142, stY + 6.5);
    const sbg = this.statusBg(data.status);
    const sc = this.statusColor(data.status);
    doc.setFillColor(...sbg);
    doc.roundedRect(166, stY + 3, 20, 6, 1.5, 1.5, "F");
    this.checkIcon(doc, 168.5, stY + 4.3, 3, sc);
    doc.setFont("Lato", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...sc);
    doc.text(data.status.toUpperCase(), 177.5, stY + 7, { align: "center" });
    doc.setFont("Lato", "normal");
    doc.setFontSize(6.8);
    doc.setTextColor(...BRAND.COLOR_LIGHT);
    doc.text(pmeta.subtitle(data.date, data.dueDate), 142, stY + 13);

    // ── divider ───────────────────────────────────────────────────────────
    const divY = Math.max(62, stY + 20);
    doc.setDrawColor(...BRAND.COLOR_BORDER);
    doc.setLineWidth(0.4);
    doc.line(LX, divY, RX, divY);

    // ── Bill To + Invoice Details cards ───────────────────────────────────
    const cardY = divY + 6;
    const cardH = 44;
    const leftW = 82, rightX = 108, rightW = 82;
    this.proCard(doc, LX, cardY, leftW, cardH);
    this.proCard(doc, rightX, cardY, rightW, cardH);

    // Bill To
    doc.setFont("Lato", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...BRAND.COLOR_LIGHT);
    doc.text("BILL TO", LX + 5, cardY + 7);
    doc.setFont("Lato", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...BRAND.COLOR_INK);
    doc.text(data.customer.name, LX + 5, cardY + 14);
    doc.setFont("Lato", "normal");
    doc.setFontSize(7.8);
    doc.setTextColor(...BRAND.COLOR_BODY);
    doc.text(data.customer.email, LX + 5, cardY + 19.5);
    doc.setFontSize(7.2);
    doc.setTextColor(...BRAND.COLOR_MUTED);
    const addrLines = doc.splitTextToSize(data.customer.billingAddress, leftW - 10);
    addrLines.forEach((line: string, i: number) => doc.text(line, LX + 5, cardY + 24.5 + i * 4));
    doc.setDrawColor(...BRAND.COLOR_BORDER);
    doc.setLineWidth(0.25);
    doc.line(LX + 5, cardY + 32, LX + leftW - 5, cardY + 32);
    if (data.customer.customerId) this.proRow(doc, "Customer ID", data.customer.customerId, LX + 5, LX + leftW - 5, cardY + 37.5);
    if (data.customer.accountNumber) this.proRow(doc, "Account No.", data.customer.accountNumber, LX + 5, LX + leftW - 5, cardY + 41.8);

    // Invoice Details
    doc.setFont("Lato", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...BRAND.COLOR_LIGHT);
    doc.text("INVOICE DETAILS", rightX + 5, cardY + 7);
    const detailRows: [string, string][] = [
      ["Reference No.", data.referenceNumber ?? "—"],
      ["PO / Reference", data.poReference ?? "—"],
      ["Payment Terms", data.paymentTerms ?? "Immediate"],
      ["Billing Period", data.billingPeriod ?? "—"],
      ["Invoice Type", data.invoiceType ?? "Service"],
    ];
    let dy = cardY + 14;
    detailRows.forEach(([l, v]) => {
      this.proRow(doc, l, v, rightX + 5, rightX + rightW - 5, dy, { size: 7.8, bold: true });
      dy += 6;
    });

    // ── line items table ──────────────────────────────────────────────────
    let cy = cardY + cardH + 7;
    doc.setFillColor(...BRAND.COLOR_BG);
    doc.rect(LX, cy, CW, 7, "F");
    doc.setDrawColor(...BRAND.COLOR_BORDER);
    doc.setLineWidth(0.3);
    doc.line(LX, cy, RX, cy);
    doc.line(LX, cy + 7, RX, cy + 7);
    doc.setFont("Lato", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...BRAND.COLOR_INK);
    doc.text("#", LX + 4, cy + 4.7);
    doc.text("DESCRIPTION", LX + 12, cy + 4.7);
    doc.text("CATEGORY", 100, cy + 4.7);
    doc.text("QTY", 128, cy + 4.7, { align: "right" });
    doc.text("UNIT PRICE", 152, cy + 4.7, { align: "right" });
    doc.text("TAX", 168, cy + 4.7, { align: "right" });
    doc.text("AMOUNT", RX - 2, cy + 4.7, { align: "right" });

    cy += 7;
    let subtotal = 0;
    data.items.forEach((item, idx) => {
      const rh = item.note ? 12 : 8;
      if (idx % 2 === 0) {
        doc.setFillColor(250, 251, 253);
        doc.rect(LX, cy, CW, rh, "F");
      }
      const ty = cy + (item.note ? 5 : 5.3);
      subtotal += item.amount;

      doc.setFont("Lato", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...BRAND.COLOR_MUTED);
      doc.text(String(idx + 1), LX + 4, ty);
      doc.setFont("Lato", "bold");
      doc.setFontSize(8.3);
      doc.setTextColor(...BRAND.COLOR_INK);
      doc.text(item.description, LX + 12, ty);
      if (item.note) {
        doc.setFont("Lato", "normal");
        doc.setFontSize(6.8);
        doc.setTextColor(...BRAND.COLOR_LIGHT);
        doc.text(item.note, LX + 12, ty + 4.3);
      }
      doc.setFont("Lato", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...BRAND.COLOR_BODY);
      doc.text(item.category, 100, ty);
      doc.text(String(item.quantity), 128, ty, { align: "right" });
      doc.text(this.fmt(item.unitPrice, S), 152, ty, { align: "right" });
      doc.text(`${Math.round(item.taxRate * 100)}% (Incl.)`, 168, ty, { align: "right" });
      doc.setFont("Lato", "bold");
      doc.setTextColor(...BRAND.COLOR_INK);
      doc.text(this.fmt(item.amount, S), RX - 2, ty, { align: "right" });

      cy += rh;
      doc.setDrawColor(...BRAND.COLOR_BORDER);
      doc.setLineWidth(0.2);
      doc.line(LX, cy, RX, cy);
    });

    // ── note box ──────────────────────────────────────────────────────────
    cy += 4.5;
    doc.setFillColor(...BRAND.COLOR_BG);
    doc.roundedRect(LX, cy, CW, 11.5, 2, 2, "F");
    doc.setFillColor(...accentRgb);
    doc.circle(LX + 7, cy + 5.75, 1.5, "F");
    doc.setFont("Lato", "normal");
    doc.setFontSize(7.4);
    doc.setTextColor(...BRAND.COLOR_BODY);
    doc.text(data.note ?? "Thank you for investing with FinTrack. Your financial growth is our priority.", LX + 13, cy + 6.5);

    // ── Payment Summary + Payment Information ─────────────────────────────
    cy += 11.5 + 6;
    const card2H = 78;
    this.proCard(doc, LX, cy, leftW, card2H);
    this.proCard(doc, rightX, cy, rightW, card2H);

    doc.setFont("Lato", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...BRAND.COLOR_LIGHT);
    doc.text("PAYMENT SUMMARY", LX + 5, cy + 7);

    const disc = data.discount ?? 0;
    const fee = data.processingFee ?? 0;
    let sy = cy + 13;
    this.proRow(doc, "Subtotal", this.fmt(subtotal, S), LX + 5, LX + leftW - 5, sy); sy += 5.1;
    this.proRow(doc, "Discount", this.fmt(disc, S), LX + 5, LX + leftW - 5, sy); sy += 5.1;
    this.proRow(doc, "Tax (GST 18% Inclusive)", this.fmt(0, S), LX + 5, LX + leftW - 5, sy); sy += 5.1;
    this.proRow(doc, "Processing Fee", this.fmt(fee, S), LX + 5, LX + leftW - 5, sy); sy += 5.1;
    this.proRow(doc, "Adjustments", this.fmt(0, S), LX + 5, LX + leftW - 5, sy); sy += 3.6;
    doc.setDrawColor(...BRAND.COLOR_BORDER);
    doc.line(LX + 5, sy, LX + leftW - 5, sy); sy += 5.1;
    this.proRow(doc, pmeta.amountLabel, this.fmt(subtotal, S), LX + 5, LX + leftW - 5, sy, { bold: true, color: BRAND.COLOR_INK }); sy += 2.8;
    doc.setDrawColor(...accentRgb);
    doc.setLineWidth(0.5);
    doc.line(LX + 5, sy, LX + leftW - 5, sy); sy += 6.5;
    doc.setFont("Lato", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...BRAND.COLOR_INK);
    doc.text("GRAND TOTAL", LX + 5, sy);
    doc.setFontSize(12);
    doc.setTextColor(...accentRgb);
    doc.text(this.fmt(subtotal - disc + fee, S), LX + leftW - 5, sy, { align: "right" });

    sy += 5;
    doc.setFillColor(...this.statusBg(data.status));
    doc.roundedRect(LX + 5, sy, leftW - 10, 11, 2, 2, "F");
    this.checkIcon(doc, LX + 9, sy + 1.8, 3.4, this.statusColor(data.status));
    doc.setFont("Lato", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...this.statusColor(data.status));
    doc.text(pmeta.banner, LX + 14, sy + 5);
    doc.setFont("Lato", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(...BRAND.COLOR_MUTED);
    doc.text(pmeta.bannerSub, LX + 14, sy + 8.7);

    // Payment Information
    doc.setFont("Lato", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...BRAND.COLOR_LIGHT);
    doc.text("PAYMENT INFORMATION", rightX + 5, cy + 7);
    const infoRows: [string, string][] = [
      ["Payment Method", data.paymentMethod],
      ["Transaction ID", data.transactionId],
      ["Reference Number", data.referenceNumber ?? "—"],
      ["Payment Gateway", data.paymentGateway ?? "FinTrack Secure Gateway"],
      ["Payment Date", data.paymentTimestamp ?? `${data.date}, 10:24 AM`],
    ];
    let iy = cy + 13;
    infoRows.forEach(([l, v]) => {
      this.proRow(doc, l, v, rightX + 5, rightX + rightW - 5, iy, { size: 7.5, bold: true });
      iy += 5.1;
    });
    this.proRow(doc, "Payment Status", "", rightX + 5, rightX + rightW - 5, iy);
    doc.setFillColor(...this.statusBg(pmeta.pill));
    doc.roundedRect(rightX + rightW - 24, iy - 3.3, 19, 5, 1.2, 1.2, "F");
    doc.setFont("Lato", "bold");
    doc.setFontSize(6.3);
    doc.setTextColor(...this.statusColor(pmeta.pill));
    doc.text(pmeta.pill, rightX + rightW - 14.5, iy, { align: "center" });
    iy += 5.1;
    this.proRow(doc, "Processing Time", data.processingTime ?? "—", rightX + 5, rightX + rightW - 5, iy, { size: 7.5, bold: true });

    // Verified & Secure box with QR
    iy += 4;
    const vH = 17;
    doc.setFillColor(...BRAND.COLOR_BG);
    doc.roundedRect(rightX + 3, iy, rightW - 6, vH, 2, 2, "F");
    doc.setDrawColor(...accentRgb);
    doc.setLineWidth(0.25);
    doc.roundedRect(rightX + 3, iy, rightW - 6, vH, 2, 2, "S");
    doc.setFillColor(...accentRgb);
    doc.roundedRect(rightX + 6, iy + 3, 4.5, 4.5, 1, 1, "F");
    this.checkIcon(doc, rightX + 7, iy + 3.9, 2.8, [255, 255, 255]);
    doc.setFont("Lato", "bold");
    doc.setFontSize(6.3);
    doc.setTextColor(...accentRgb);
    doc.text("VERIFIED & SECURE", rightX + 12.5, iy + 5.8);
    doc.setFont("Lato", "normal");
    doc.setFontSize(5.6);
    doc.setTextColor(...BRAND.COLOR_MUTED);
    const vLines: string[] = doc.splitTextToSize("This document is digitally verified and securely generated.", 38);
    vLines.forEach((l: string, i: number) => doc.text(l, rightX + 12.5, iy + 9.2 + i * 3.4));
    this.drawQR(doc, rightX + rightW - 18, iy + 1.5, 13);
    doc.setFont("Lato", "bold");
    doc.setFontSize(5);
    doc.setTextColor(...BRAND.COLOR_LIGHT);
    doc.text("SCAN TO VERIFY", rightX + rightW - 11.5, iy + vH - 0.8, { align: "center" });

    iy += vH + 3.5;
    doc.setFont("Lato", "normal");
    doc.setFontSize(6.3);
    doc.setTextColor(...BRAND.COLOR_LIGHT);
    const verSuffix = data.id.split("-").pop() ?? data.id;
    const txnSuffix = data.transactionId.slice(-6).toUpperCase();
    doc.text(`Verification ID: VER-2026-${verSuffix}-${txnSuffix}`, rightX + 5, iy);
    doc.text("Verify Online: verify.fintrack.io", rightX + 5, iy + 4);

    // ── footer ────────────────────────────────────────────────────────────
    const fY = ph - 36;
    doc.setDrawColor(...BRAND.COLOR_BORDER);
    doc.setLineWidth(0.3);
    doc.line(LX, fY, RX, fY);

    const fCols = [
      { x: LX,  label: "COMPANY",          lines: [BRAND.COMPANY_NAME, BRAND.COMPANY_ADDRESS_1, BRAND.COMPANY_ADDRESS_2] },
      { x: 75,  label: "SUPPORT",           lines: [BRAND.COMPANY_EMAIL, BRAND.COMPANY_PHONE, BRAND.COMPANY_WEBSITE] },
      { x: 122, label: "LEGAL",             lines: ["Terms & Conditions", "Privacy Policy", "Refund Policy"] },
      { x: 158, label: "DIGITALLY SIGNED",  lines: ["This document is digitally", "generated and does not", "require a physical signature."] },
    ];
    fCols.forEach(col => {
      doc.setFont("Lato", "bold");
      doc.setFontSize(6.3);
      doc.setTextColor(...BRAND.COLOR_LIGHT);
      doc.text(col.label, col.x, fY + 6);
      doc.setFont("Lato", "normal");
      doc.setFontSize(6.3);
      doc.setTextColor(...BRAND.COLOR_MUTED);
      col.lines.forEach((l, i) => doc.text(l, col.x, fY + 10.5 + i * 3.6));
    });

    doc.setDrawColor(...BRAND.COLOR_BORDER);
    doc.line(LX, ph - 12, RX, ph - 12);
    doc.setFont("Lato", "normal");
    doc.setFontSize(6.3);
    doc.setTextColor(...BRAND.COLOR_LIGHT);
    doc.text(`© 2026 ${BRAND.COMPANY_NAME} All rights reserved.`, 105, ph - 7.5, { align: "center" });
    doc.text("This is a computer generated invoice and does not require a signature.", 105, ph - 4, { align: "center" });

    doc.save(`fintrack_invoice_${data.id}.pdf`);
  }


  // ══════════════════════════════════════════════════════════════════════════
  // RECEIPT
  // ══════════════════════════════════════════════════════════════════════════
  public static async generateReceiptPDF(data: ReceiptData, accentRgb: [number, number, number] = BRAND.COLOR_PRIMARY) {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const S = this.sym(data.currency);

    this.drawHeader(doc, "RECEIPT", data.status, data.id, accentRgb);
    this.drawMetaRow(doc, 80, [
      { label: "Payment Date", value: data.date },
      { label: "Payment Method", value: data.paymentMethod },
      { label: "Transaction ID", value: data.transactionId },
    ]);
    this.drawCustomer(doc, data.customer, 96);

    const cardY = 135;
    this.sectionLabel(doc, "Transaction Details", cardY - 5);

    const fields = [
      { label: "Description", value: data.title },
      { label: "Category", value: data.category },
      { label: "Location", value: data.location || "Online" },
      { label: "Notes", value: data.notes || "Standard ledger expense" },
    ];

    doc.setFillColor(...BRAND.COLOR_BG);
    doc.roundedRect(20, cardY, 170, fields.length * 10 + 6, 2, 2, "F");
    doc.setDrawColor(...BRAND.COLOR_BORDER);
    doc.setLineWidth(0.3);
    doc.roundedRect(20, cardY, 170, fields.length * 10 + 6, 2, 2, "S");

    fields.forEach((f, i) => {
      const fy = cardY + 9 + i * 10;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(...BRAND.COLOR_LIGHT);
      doc.text(f.label.toUpperCase(), 25, fy);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(...BRAND.COLOR_BODY);
      doc.text(f.value, 80, fy);
    });

    const gst = data.amount * 0.18 / 1.18;
    const totY = cardY + fields.length * 10 + 18;
    this.drawTotals(doc, totY, [
      { label: "Transaction Amount", value: this.fmt(data.amount, S) },
      { label: "GST (18% incl.)", value: this.fmt(gst, S) },
      { label: "Total Settled", value: this.fmt(data.amount, S), bold: true, accent: true, line: true },
    ], accentRgb);

    const stampY = totY + 40;
    doc.setFillColor(...this.statusBg(data.status));
    doc.roundedRect(20, stampY, 170, 24, 3, 3, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...this.statusColor(data.status));
    doc.text(`${data.status.toUpperCase()} — ${this.fmt(data.amount, S)}`, 105, stampY + 14, { align: "center" });

    this.drawFooter(doc, data.id, accentRgb);
    doc.save(`fintrack_receipt_${data.id}.pdf`);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // INVESTMENT STATEMENT
  // ══════════════════════════════════════════════════════════════════════════
  public static async generateInvestmentStatementPDF(data: InvestmentData, accentRgb: [number, number, number] = BRAND.COLOR_PRIMARY) {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const S = this.sym(data.currency);

    this.drawHeader(doc, "INVESTMENT STATEMENT", data.status, data.id, accentRgb);
    this.drawMetaRow(doc, 80, [
      { label: "Statement Period", value: data.period },
      { label: "Portfolio Reference", value: data.referenceId },
      { label: "Total Invested", value: this.fmt(data.totalInvested, S) },
    ]);
    this.drawCustomer(doc, data.customer, 96);

    const tableY = 135;
    this.sectionLabel(doc, "SIP Allocation Breakdown", tableY - 5);
    this.drawTableHeader(doc, tableY, [
      { label: "Goal / Milestone", x: 24 },
      { label: "Target Date", x: 90 },
      { label: "Target Amount", x: 130, align: "right" },
      { label: "Accumulated", x: 158, align: "right" },
      { label: "Progress", x: 188, align: "right" },
    ]);

    let cy = tableY + 7;
    data.allocations.forEach((item, idx) => {
      cy += 8;
      if (idx % 2 === 0) {
        doc.setFillColor(250, 251, 253);
        doc.rect(20, cy - 5.5, 170, 8, "F");
      }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(...BRAND.COLOR_INK);
      doc.text(item.goalTitle, 24, cy);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(...BRAND.COLOR_BODY);
      doc.text(item.targetDate || "Dec 2026", 90, cy);
      doc.text(this.fmt(item.target, S), 130, cy, { align: "right" });

      doc.setFont("helvetica", "bold");
      doc.setTextColor(...BRAND.COLOR_SUCCESS);
      doc.text(this.fmt(item.saved, S), 158, cy, { align: "right" });

      const pct = Math.min(item.percent, 100);
      const pColor = pct >= 80 ? BRAND.COLOR_SUCCESS : pct >= 50 ? BRAND.COLOR_WARNING : BRAND.COLOR_DANGER;
      doc.setFillColor(...this.statusBg(pct >= 80 ? "PAID" : pct >= 50 ? "PENDING" : "FAILED"));
      doc.roundedRect(173, cy - 4, 15, 5.5, 1, 1, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(...pColor);
      doc.text(`${pct}%`, 180.5, cy, { align: "center" });

      doc.setDrawColor(...BRAND.COLOR_BORDER);
      doc.setLineWidth(0.2);
      doc.line(20, cy + 2.5, 190, cy + 2.5);
    });

    cy += 10;
    doc.setFillColor(...BRAND.COLOR_BG);
    doc.roundedRect(20, cy, 170, 14, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...BRAND.COLOR_MUTED);
    doc.text("TOTAL SIP CONTRIBUTIONS THIS PERIOD:", 25, cy + 9);
    doc.setFontSize(11);
    doc.setTextColor(...accentRgb);
    doc.text(this.fmt(data.totalInvested, S), 188, cy + 9, { align: "right" });

    this.drawFooter(doc, data.id, accentRgb);
    doc.save(`fintrack_statement_${data.id}.pdf`);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // ACCOUNT STATEMENT
  // ══════════════════════════════════════════════════════════════════════════
  public static async generateAccountStatementPDF(data: AccountData, accentRgb: [number, number, number] = BRAND.COLOR_PRIMARY) {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const S = this.sym(data.currency);

    this.drawHeader(doc, "ACCOUNT STATEMENT", "Settled", data.id, accentRgb);
    this.drawMetaRow(doc, 80, [
      { label: "Statement Month", value: data.monthName },
      { label: "Savings Rate", value: `${data.summary.savingsRate}%` },
      { label: "Financial Health Score", value: `${data.healthScore} / 100` },
    ]);
    this.drawCustomer(doc, data.customer, 96);

    const mY = 135;
    const metrics = [
      { label: "TOTAL INCOME", value: this.fmt(data.summary.totalIncome, S), color: BRAND.COLOR_SUCCESS },
      { label: "TOTAL EXPENSES", value: this.fmt(data.summary.totalExpenses, S), color: BRAND.COLOR_DANGER },
      { label: "NET SAVINGS", value: this.fmt(data.summary.netSavings, S), color: accentRgb },
    ];
    const mW = 56;
    metrics.forEach((m, i) => {
      const mx = 20 + i * (mW + 1);
      doc.setFillColor(...BRAND.COLOR_BG);
      doc.roundedRect(mx, mY, mW, 18, 2, 2, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(...BRAND.COLOR_LIGHT);
      doc.text(m.label, mx + 4, mY + 7);
      doc.setFontSize(11);
      doc.setTextColor(...m.color);
      doc.text(m.value, mx + 4, mY + 14);
    });

    const bY = mY + 25;
    this.sectionLabel(doc, "Budget Envelope Status", bY - 4);
    this.drawTableHeader(doc, bY, [
      { label: "Category", x: 24 },
      { label: "Budget Limit", x: 80, align: "right" },
      { label: "Amount Spent", x: 120, align: "right" },
      { label: "Utilization", x: 155, align: "right" },
      { label: "Status", x: 188, align: "right" },
    ]);

    let cy = bY + 7;
    data.budgets.forEach((b, idx) => {
      cy += 7;
      if (idx % 2 === 0) {
        doc.setFillColor(250, 251, 253);
        doc.rect(20, cy - 4.5, 170, 7, "F");
      }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(...BRAND.COLOR_INK);
      doc.text(b.category, 24, cy);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(...BRAND.COLOR_BODY);
      doc.text(this.fmt(b.limit, S), 80, cy, { align: "right" });
      doc.text(this.fmt(b.spent, S), 120, cy, { align: "right" });
      doc.text(`${b.percentage}%`, 155, cy, { align: "right" });

      const isOk = b.percentage < 80;
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...(isOk ? BRAND.COLOR_SUCCESS : b.percentage >= 100 ? BRAND.COLOR_DANGER : BRAND.COLOR_WARNING));
      doc.text(b.status.toUpperCase(), 188, cy, { align: "right" });

      doc.setDrawColor(...BRAND.COLOR_BORDER);
      doc.setLineWidth(0.2);
      doc.line(20, cy + 2.5, 190, cy + 2.5);
    });

    cy += 12;
    this.sectionLabel(doc, "Top Transactions", cy - 4);
    this.drawTableHeader(doc, cy, [
      { label: "Date", x: 24 },
      { label: "Description", x: 50 },
      { label: "Category", x: 110 },
      { label: "Method", x: 148 },
      { label: "Amount", x: 188, align: "right" },
    ]);

    cy += 7;
    data.topSpends.forEach((item, idx) => {
      cy += 7;
      if (idx % 2 === 0) {
        doc.setFillColor(250, 251, 253);
        doc.rect(20, cy - 4.5, 170, 7, "F");
      }
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(...BRAND.COLOR_BODY);
      doc.text(item.date, 24, cy);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...BRAND.COLOR_INK);
      doc.text(item.title, 50, cy);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...BRAND.COLOR_BODY);
      doc.text(item.category, 110, cy);
      doc.text(item.method, 148, cy);
      doc.setFont("helvetica", "bold");
      doc.text(this.fmt(item.amount, S), 188, cy, { align: "right" });

      doc.setDrawColor(...BRAND.COLOR_BORDER);
      doc.setLineWidth(0.2);
      doc.line(20, cy + 2.5, 190, cy + 2.5);
    });

    this.drawFooter(doc, data.id, accentRgb);
    doc.save(`fintrack_account_${data.id}.pdf`);
  }
}
