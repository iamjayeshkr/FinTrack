import { Budget } from "../../domain/entities/budget";

export interface INotificationService {
  notifyBudgetBreach(
    userId: string,
    budget: Budget,
    thresholdPercentage: number
  ): Promise<void>;
  notifyGoalMilestone(
    userId: string,
    goalTitle: string,
    percentage: number
  ): Promise<void>;
  notifyRecurringTransactionAlert(
    userId: string,
    title: string,
    amount: number
  ): Promise<void>;
}
