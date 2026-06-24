import { Budget } from "../../domain/entities/budget";

export interface IBudgetRepository {
  findById(id: string): Promise<Budget | null>;
  findByCategory(
    userId: string,
    categoryId: string,
    month: number,
    year: number
  ): Promise<Budget | null>;
  findByUserAndMonth(
    userId: string,
    month: number,
    year: number
  ): Promise<Budget[]>;
  save(budget: Budget): Promise<void>;
  delete(id: string): Promise<void>;
}
