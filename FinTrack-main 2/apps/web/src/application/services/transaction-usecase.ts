import { Transaction } from "../../domain/entities/transaction";
import { Money } from "../../domain/value-objects/money";
import { CreateTransactionDTO } from "../dtos/transaction.dto";
import { ITransactionRepository } from "../ports/transaction-repository";
import { IBudgetRepository } from "../ports/budget-repository";
import { IGoalRepository } from "../ports/goal-repository";
import { INotificationService } from "../ports/notification-service";

export class TransactionUseCase {
  constructor(
    private readonly transactionRepo: ITransactionRepository,
    private readonly budgetRepo: IBudgetRepository,
    private readonly goalRepo: IGoalRepository,
    private readonly notificationService: INotificationService
  ) {}

  async executeCreate(dto: CreateTransactionDTO): Promise<Transaction> {
    // 1. Establish money value object
    const money = new Money(dto.amount, dto.currency);

    // 2. Instantiate core domain model
    const transaction = new Transaction(
      crypto.randomUUID(),
      dto.userId,
      dto.categoryId,
      dto.title,
      money,
      dto.type,
      dto.paymentMethod,
      dto.date,
      dto.description || null,
      dto.goalId || null,
      dto.tags || [],
      dto.location || null
    );

    // 3. Save to database using port
    await this.transactionRepo.save(transaction);

    // 4. Handle savings target goals contributions
    if (dto.goalId && (dto.type === "SAVINGS" || dto.type === "INVESTMENT")) {
      const goal = await this.goalRepo.findById(dto.goalId);
      if (goal) {
        const previousProgress = goal.getProgressPercentage();
        goal.contribute(money);
        await this.goalRepo.save(goal);

        const currentProgress = goal.getProgressPercentage();
        // Check milestone thresholds: 50%, 100%
        if (previousProgress < 50 && currentProgress >= 50) {
          await this.notificationService.notifyGoalMilestone(dto.userId, goal.title, 50);
        }
        if (previousProgress < 100 && currentProgress >= 100) {
          await this.notificationService.notifyGoalMilestone(dto.userId, goal.title, 100);
        }
      }
    }

    // 5. Run budget limits validation on expenses
    if (dto.type === "EXPENSE") {
      await this.evaluateBudgetTension(transaction);
    }

    return transaction;
  }

  private async evaluateBudgetTension(transaction: Transaction): Promise<void> {
    const month = transaction.date.getMonth() + 1;
    const year = transaction.date.getFullYear();

    const budget = await this.budgetRepo.findByCategory(
      transaction.userId,
      transaction.categoryId,
      month,
      year
    );

    if (!budget) return;

    // Sum active expenses in the budget category for this month
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    const monthlyTransactions = await this.transactionRepo.findByUserIdAndDateRange(
      transaction.userId,
      startOfMonth,
      endOfMonth
    );

    const aggregateSpent = monthlyTransactions
      .filter(t => t.categoryId === transaction.categoryId && t.type === "EXPENSE")
      .reduce((sum, t) => sum + t.amount.amount, 0);

    const percentageUsed = (aggregateSpent / budget.limitAmount.amount) * 100;
    const previousPercentage = ((aggregateSpent - transaction.amount.amount) / budget.limitAmount.amount) * 100;

    // Send notifications for crossed budget limit thresholds
    const thresholds = [50, 75, 90, 100];
    for (const threshold of thresholds) {
      if (previousPercentage < threshold && percentageUsed >= threshold) {
        await this.notificationService.notifyBudgetBreach(
          transaction.userId,
          budget,
          threshold
        );
      }
    }
  }
}
