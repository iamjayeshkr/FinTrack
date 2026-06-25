export class Money {
  constructor(
    public readonly amount: number,
    public readonly currency: string = "INR"
  ) {
    if (isNaN(amount)) {
      throw new Error("Money amount must be a valid number");
    }
  }

  static zero(currency: string = "INR"): Money {
    return new Money(0, currency);
  }

  add(other: Money): Money {
    this.validateCurrencyMatch(other);
    return new Money(this.amount + other.amount, this.currency);
  }

  subtract(other: Money): Money {
    this.validateCurrencyMatch(other);
    return new Money(this.amount - other.amount, this.currency);
  }

  multiply(multiplier: number): Money {
    return new Money(this.amount * multiplier, this.currency);
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }

  isGreaterThan(other: Money): boolean {
    this.validateCurrencyMatch(other);
    return this.amount > other.amount;
  }

  isGreaterThanOrEqual(other: Money): boolean {
    this.validateCurrencyMatch(other);
    return this.amount >= other.amount;
  }

  isZeroOrNegative(): boolean {
    return this.amount <= 0;
  }

  private validateCurrencyMatch(other: Money): void {
    if (this.currency !== other.currency) {
      throw new Error(`Currency mismatch: Cannot compute ${this.currency} with ${other.currency}`);
    }
  }
}
