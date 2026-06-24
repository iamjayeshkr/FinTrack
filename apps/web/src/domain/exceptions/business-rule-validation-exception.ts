export class BusinessRuleValidationException extends Error {
  constructor(
    public readonly ruleName: string,
    message: string
  ) {
    super(message);
    this.name = "BusinessRuleValidationException";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
