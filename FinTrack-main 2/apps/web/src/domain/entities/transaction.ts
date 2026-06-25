import { Money } from "../value-objects/money";

export type TransactionType = "INCOME" | "EXPENSE" | "SAVINGS" | "INVESTMENT" | "TRANSFER";
export type PaymentMethod = "CASH" | "UPI" | "CARD" | "BANK_TRANSFER" | "WALLET";

export interface AttachmentInfo {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
}

export class Transaction {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public categoryId: string,
    public title: string,
    public amount: Money,
    public type: TransactionType,
    public paymentMethod: PaymentMethod,
    public date: Date,
    public description: string | null = null,
    public goalId: string | null = null,
    public tags: string[] = [],
    public location: string | null = null,
    public attachments: AttachmentInfo[] = [],
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {
    if (title.trim().length === 0) {
      throw new Error("Transaction title cannot be empty");
    }
    if (amount.isZeroOrNegative()) {
      throw new Error("Transaction amount must be greater than zero");
    }
  }

  addAttachment(attachment: AttachmentInfo): void {
    this.attachments.push(attachment);
    this.updatedAt = new Date();
  }

  removeAttachment(attachmentId: string): void {
    this.attachments = this.attachments.filter(a => a.id !== attachmentId);
    this.updatedAt = new Date();
  }

  updateCategory(newCategoryId: string): void {
    this.categoryId = newCategoryId;
    this.updatedAt = new Date();
  }

  linkToGoal(goalId: string): void {
    if (this.type !== "SAVINGS" && this.type !== "INVESTMENT") {
      throw new Error("Only SAVINGS or INVESTMENT transactions can be linked to goals");
    }
    this.goalId = goalId;
    this.updatedAt = new Date();
  }
}
