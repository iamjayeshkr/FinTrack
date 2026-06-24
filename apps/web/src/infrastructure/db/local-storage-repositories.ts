import { ITransactionRepository } from "../../application/ports/transaction-repository";
import { IBudgetRepository } from "../../application/ports/budget-repository";
import { IGoalRepository } from "../../application/ports/goal-repository";
import { Transaction } from "../../domain/entities/transaction";
import { Budget } from "../../domain/entities/budget";
import { Goal } from "../../domain/entities/goal";
import { Money } from "../../domain/value-objects/money";

export class LocalStorageTransactionRepository implements ITransactionRepository {
  private getStorage(): any[] {
    if (typeof window === "undefined") return [];
    const data = localStorage.getItem("apex_transactions");
    return data ? JSON.parse(data) : [];
  }

  private setStorage(data: any[]): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("apex_transactions", JSON.stringify(data));
    }
  }

  async findById(id: string): Promise<Transaction | null> {
    const raw = this.getStorage().find(t => t.id === id);
    if (!raw) return null;
    return this.mapToEntity(raw);
  }

  async save(transaction: Transaction): Promise<void> {
    const data = this.getStorage();
    const index = data.findIndex(t => t.id === transaction.id);
    const serialized = this.mapToRaw(transaction);
    if (index >= 0) {
      data[index] = serialized;
    } else {
      data.push(serialized);
    }
    this.setStorage(data);
  }

  async delete(id: string): Promise<void> {
    const data = this.getStorage().filter(t => t.id !== id);
    this.setStorage(data);
  }

  async findByUserIdAndDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Transaction[]> {
    const txns = this.getStorage()
      .filter(t => t.userId === userId)
      .map(t => this.mapToEntity(t))
      .filter(t => t.date >= startDate && t.date <= endDate);
    return txns;
  }

  async searchTransactions(userId: string, query: string): Promise<Transaction[]> {
    const term = query.toLowerCase().trim();
    if (!term) {
      return this.getStorage()
        .filter(t => t.userId === userId)
        .map(t => this.mapToEntity(t));
    }
    return this.getStorage()
      .filter(t => t.userId === userId)
      .map(t => this.mapToEntity(t))
      .filter(t => 
        t.title.toLowerCase().includes(term) ||
        (t.description && t.description.toLowerCase().includes(term)) ||
        t.tags.some(tag => tag.toLowerCase().includes(term)) ||
        t.paymentMethod.toLowerCase().includes(term)
      );
  }

  private mapToEntity(raw: any): Transaction {
    return new Transaction(
      raw.id,
      raw.userId,
      raw.categoryId,
      raw.title,
      new Money(raw.amount.amount, raw.amount.currency),
      raw.type,
      raw.paymentMethod,
      new Date(raw.date),
      raw.description || null,
      raw.goalId || null,
      raw.tags || [],
      raw.location || null,
      raw.attachments || [],
      new Date(raw.createdAt),
      new Date(raw.updatedAt)
    );
  }

  private mapToRaw(entity: Transaction): any {
    return {
      id: entity.id,
      userId: entity.userId,
      categoryId: entity.categoryId,
      title: entity.title,
      amount: { amount: entity.amount.amount, currency: entity.amount.currency },
      type: entity.type,
      paymentMethod: entity.paymentMethod,
      date: entity.date.toISOString(),
      description: entity.description,
      goalId: entity.goalId,
      tags: entity.tags,
      location: entity.location,
      attachments: entity.attachments,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }
}

export class LocalStorageBudgetRepository implements IBudgetRepository {
  private getStorage(): any[] {
    if (typeof window === "undefined") return [];
    const data = localStorage.getItem("apex_budgets");
    return data ? JSON.parse(data) : [];
  }

  private setStorage(data: any[]): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("apex_budgets", JSON.stringify(data));
    }
  }

  async findById(id: string): Promise<Budget | null> {
    const raw = this.getStorage().find(b => b.id === id);
    if (!raw) return null;
    return this.mapToEntity(raw);
  }

  async findByCategory(
    userId: string,
    categoryId: string,
    month: number,
    year: number
  ): Promise<Budget | null> {
    const raw = this.getStorage().find(
      b => b.userId === userId && b.categoryId === categoryId && b.month === month && b.year === year
    );
    if (!raw) return null;
    return this.mapToEntity(raw);
  }

  async findByUserAndMonth(userId: string, month: number, year: number): Promise<Budget[]> {
    return this.getStorage()
      .filter(b => b.userId === userId && b.month === month && b.year === year)
      .map(b => this.mapToEntity(b));
  }

  async save(budget: Budget): Promise<void> {
    const data = this.getStorage();
    const index = data.findIndex(b => b.id === budget.id);
    const serialized = this.mapToRaw(budget);
    if (index >= 0) {
      data[index] = serialized;
    } else {
      data.push(serialized);
    }
    this.setStorage(data);
  }

  async delete(id: string): Promise<void> {
    const data = this.getStorage().filter(b => b.id !== id);
    this.setStorage(data);
  }

  private mapToEntity(raw: any): Budget {
    return new Budget(
      raw.id,
      raw.userId,
      raw.categoryId,
      new Money(raw.limitAmount.amount, raw.limitAmount.currency),
      raw.month,
      raw.year,
      new Date(raw.createdAt),
      new Date(raw.updatedAt)
    );
  }

  private mapToRaw(entity: Budget): any {
    return {
      id: entity.id,
      userId: entity.userId,
      categoryId: entity.categoryId,
      limitAmount: { amount: entity.limitAmount.amount, currency: entity.limitAmount.currency },
      month: entity.month,
      year: entity.year,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }
}

export class LocalStorageGoalRepository implements IGoalRepository {
  private getStorage(): any[] {
    if (typeof window === "undefined") return [];
    const data = localStorage.getItem("apex_goals");
    return data ? JSON.parse(data) : [];
  }

  private setStorage(data: any[]): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("apex_goals", JSON.stringify(data));
    }
  }

  async findById(id: string): Promise<Goal | null> {
    const raw = this.getStorage().find(g => g.id === id);
    if (!raw) return null;
    return this.mapToEntity(raw);
  }

  async findByUserId(userId: string): Promise<Goal[]> {
    return this.getStorage()
      .filter(g => g.userId === userId)
      .map(g => this.mapToEntity(g));
  }

  async save(goal: Goal): Promise<void> {
    const data = this.getStorage();
    const index = data.findIndex(g => g.id === goal.id);
    const serialized = this.mapToRaw(goal);
    if (index >= 0) {
      data[index] = serialized;
    } else {
      data.push(serialized);
    }
    this.setStorage(data);
  }

  async delete(id: string): Promise<void> {
    const data = this.getStorage().filter(g => g.id !== id);
    this.setStorage(data);
  }

  private mapToEntity(raw: any): Goal {
    return new Goal(
      raw.id,
      raw.userId,
      raw.title,
      new Money(raw.targetAmount.amount, raw.targetAmount.currency),
      new Money(raw.currentAmount.amount, raw.currentAmount.currency),
      raw.targetDate ? new Date(raw.targetDate) : null,
      new Date(raw.createdAt),
      new Date(raw.updatedAt)
    );
  }

  private mapToRaw(entity: Goal): any {
    return {
      id: entity.id,
      userId: entity.userId,
      title: entity.title,
      targetAmount: { amount: entity.targetAmount.amount, currency: entity.targetAmount.currency },
      currentAmount: { amount: entity.currentAmount.amount, currency: entity.currentAmount.currency },
      targetDate: entity.targetDate ? entity.targetDate.toISOString() : null,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }
}
