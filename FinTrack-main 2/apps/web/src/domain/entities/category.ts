export type CategoryType = "INCOME" | "EXPENSE" | "SAVINGS" | "INVESTMENT";

export class Category {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public name: string,
    public type: CategoryType,
    public parentId: string | null = null,
    public icon: string | null = null,
    public color: string = "#000000",
    public isCustom: boolean = true,
    public readonly createdAt: Date = new Date()
  ) {
    if (name.trim().length === 0) {
      throw new Error("Category name cannot be empty");
    }
    if (!color.startsWith("#") || color.length !== 7) {
      throw new Error("Category color must be a valid hex color code (e.g. #FFFFFF)");
    }
  }

  isSubcategory(): boolean {
    return this.parentId !== null;
  }
}
