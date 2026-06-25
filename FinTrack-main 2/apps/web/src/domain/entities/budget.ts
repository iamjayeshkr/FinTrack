import { Money } from "../value-objects/money";

export class Budget {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly categoryId: string,
    public limitAmount: Money,
    public readonly month: number,
    public readonly year: number,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {
    if (month < 1 || month > 12) {
      throw new Error("Month must be between 1 and 12");
    }
    if (year < 2000) {
      throw new Error("Year must be a valid 4-digit calendar year");
    }
    if (limitAmount.isZeroOrNegative()) {
      throw new Error("Budget limit must be greater than zero");
    }
  }

  updateLimit(newLimit: Money): void {
    if (newLimit.isZeroOrNegative()) {
      throw new Error("Budget limit must be greater than zero");
    }
    this.limitAmount = newLimit;
    this.updatedAt = new Date();
  }
}
