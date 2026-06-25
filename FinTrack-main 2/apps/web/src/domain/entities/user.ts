export class User {
  constructor(
    public readonly id: string,
    public readonly clerkId: string,
    public email: string,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {
    if (!email.includes("@")) {
      throw new Error("Invalid email address format");
    }
  }
}
