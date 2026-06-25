import { Money } from "../value-objects/money";
import { BusinessRuleValidationException } from "../exceptions/business-rule-validation-exception";

export class Goal {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public title: string,
    public targetAmount: Money,
    public currentAmount: Money,
    public targetDate: Date | null,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {
    if (title.trim().length === 0) {
      throw new Error("Goal title cannot be empty");
    }
    if (targetAmount.isZeroOrNegative()) {
      throw new Error("Goal target amount must be greater than zero");
    }
  }

  getProgressPercentage(): number {
    if (this.targetAmount.amount === 0) return 0;
    const percentage = (this.currentAmount.amount / this.targetAmount.amount) * 100;
    return Math.min(Math.round(percentage * 100) / 100, 100);
  }

  contribute(amount: Money): void {
    if (amount.isZeroOrNegative()) {
      throw new BusinessRuleValidationException(
        "InvalidContribution",
        "Contribution amount must be positive"
      );
    }
    this.currentAmount = this.currentAmount.add(amount);
    this.updatedAt = new Date();
  }

  isCompleted(): boolean {
    return this.currentAmount.isGreaterThanOrEqual(this.targetAmount);
  }
}
