import { Money } from "../value-objects/money";
import { TransactionType, PaymentMethod } from "./transaction";

export type Frequency = "DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY" | "YEARLY";

export class RecurringTransaction {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public categoryId: string,
    public title: string,
    public amount: Money,
    public type: Exclude<TransactionType, "TRANSFER">,
    public frequency: Frequency,
    public startDate: Date,
    public nextExecutionDate: Date,
    public paymentMethod: PaymentMethod,
    public endDate: Date | null = null,
    public isActive: boolean = true,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {
    if (title.trim().length === 0) {
      throw new Error("Title cannot be empty");
    }
    if (amount.isZeroOrNegative()) {
      throw new Error("Amount must be greater than zero");
    }
    if (endDate && endDate < startDate) {
      throw new Error("End date cannot be prior to start date");
    }
  }

  deactivate(): void {
    this.isActive = false;
    this.updatedAt = new Date();
  }

  calculateNextExecution(): Date {
    const current = new Date(this.nextExecutionDate);
    switch (this.frequency) {
      case "DAILY":
        current.setDate(current.getDate() + 1);
        break;
      case "WEEKLY":
        current.setDate(current.getDate() + 7);
        break;
      case "MONTHLY":
        current.setMonth(current.getMonth() + 1);
        break;
      case "QUARTERLY":
        current.setMonth(current.getMonth() + 3);
        break;
      case "YEARLY":
        current.setFullYear(current.getFullYear() + 1);
        break;
    }
    return current;
  }

  updateExecutionDate(): void {
    const next = this.calculateNextExecution();
    if (this.endDate && next > this.endDate) {
      this.isActive = false;
    } else {
      this.nextExecutionDate = next;
    }
    this.updatedAt = new Date();
  }
}
