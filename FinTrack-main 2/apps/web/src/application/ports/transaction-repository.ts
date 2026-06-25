import { Transaction } from "../../domain/entities/transaction";

export interface ITransactionRepository {
  findById(id: string): Promise<Transaction | null>;
  save(transaction: Transaction): Promise<void>;
  delete(id: string): Promise<void>;
  findByUserIdAndDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Transaction[]>;
  searchTransactions(
    userId: string,
    query: string
  ): Promise<Transaction[]>;
}
