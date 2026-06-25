import { TransactionType, PaymentMethod } from "../../domain/entities/transaction";

export interface CreateTransactionDTO {
  userId: string;
  categoryId: string;
  goalId?: string;
  title: string;
  description?: string;
  amount: number;
  currency: string;
  type: TransactionType;
  paymentMethod: PaymentMethod;
  date: Date;
  tags?: string[];
  location?: string;
}

export interface UpdateTransactionDTO {
  id: string;
  categoryId?: string;
  goalId?: string;
  title?: string;
  description?: string;
  amount?: number;
  type?: TransactionType;
  paymentMethod?: PaymentMethod;
  date?: Date;
  tags?: string[];
  location?: string;
}
