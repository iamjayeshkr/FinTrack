export type TransactionType = "INCOME" | "EXPENSE" | "SAVINGS" | "INVESTMENT" | "TRANSFER";
export type PaymentMethod = "CASH" | "UPI" | "CARD" | "BANK_TRANSFER" | "WALLET";
export type Frequency = "DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY" | "YEARLY";
export type BudgetPeriod = "WEEKLY" | "MONTHLY" | "CUSTOM";
export type GoalStatus = "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED";
export type UserRole = "USER" | "ADMIN" | "SUPER_ADMIN";

export interface UserDto {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  currency: string;
  createdAt: string;
}

export interface TransactionDto {
  id: string;
  type: TransactionType;
  amount: number;
  currency: string;
  title: string;
  notes?: string;
  categoryId?: string;
  paymentMethod?: PaymentMethod;
  tags: string[];
  occurredAt: string;
  createdAt: string;
}

export interface CreateTransactionDto {
  type: TransactionType;
  amount: number;
  currency: string;
  title: string;
  notes?: string;
  categoryId?: string;
  paymentMethod?: PaymentMethod;
  tags?: string[];
  occurredAt: string;
}

export interface BudgetDto {
  id: string;
  categoryId: string;
  limitAmount: number;
  month: number;
  year: number;
  spent: number;
}
