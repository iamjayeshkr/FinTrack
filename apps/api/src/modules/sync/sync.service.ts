import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";

@Injectable()
export class SyncService {
  constructor(private readonly prisma: PrismaService) {}

  async syncUserData(dto: any) {
    const { clerkId, email, transactions, budgets, goals, settings } = dto;

    if (!clerkId) {
      throw new Error("clerkId is required for synchronization.");
    }

    // 1. Find or create user record
    let user = await this.prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          clerkId,
          email: email || `${clerkId}@fintrack.local`,
        },
      });
    }

    const dbUserId = user.id;

    // 2. Extract Category names from incoming transactions and budgets
    const categoryNames = new Set<string>();
    if (transactions && Array.isArray(transactions)) {
      transactions.forEach((t: any) => {
        if (t.categoryId) categoryNames.add(t.categoryId);
      });
    }
    if (budgets && Array.isArray(budgets)) {
      budgets.forEach((b: any) => {
        if (b.categoryId) categoryNames.add(b.categoryId);
      });
    }

    // Fetch existing category records
    const existingCategories = await this.prisma.category.findMany({
      where: { userId: dbUserId },
    });

    const categoryMap = new Map<string, string>(); // name -> UUID
    existingCategories.forEach((cat) => {
      categoryMap.set(cat.name, cat.id);
    });

    // Create missing Category entities
    for (const catName of categoryNames) {
      if (!categoryMap.has(catName)) {
        const matchingTx = transactions.find((t: any) => t.categoryId === catName);
        const type = matchingTx ? matchingTx.type : "EXPENSE";

        const newCat = await this.prisma.category.create({
          data: {
            userId: dbUserId,
            name: catName,
            type: type,
            color: "#6D5DFC",
          },
        });
        categoryMap.set(catName, newCat.id);
      }
    }

    // 3. Upsert Goals
    if (goals && Array.isArray(goals)) {
      for (const g of goals) {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(g.id);
        if (!isUuid) continue;

        await this.prisma.goal.upsert({
          where: { id: g.id },
          create: {
            id: g.id,
            userId: dbUserId,
            title: g.title,
            targetAmount: g.targetAmount?.amount || 0,
            currentAmount: g.currentAmount?.amount || 0,
            targetDate: g.targetDate ? new Date(g.targetDate) : null,
            createdAt: g.createdAt ? new Date(g.createdAt) : new Date(),
            updatedAt: g.updatedAt ? new Date(g.updatedAt) : new Date(),
          },
          update: {
            title: g.title,
            targetAmount: g.targetAmount?.amount || 0,
            currentAmount: g.currentAmount?.amount || 0,
            targetDate: g.targetDate ? new Date(g.targetDate) : null,
            updatedAt: new Date(),
          },
        });
      }
    }

    // 4. Upsert Transactions
    if (transactions && Array.isArray(transactions)) {
      for (const t of transactions) {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(t.id);
        if (!isUuid) continue;

        const categoryId = categoryMap.get(t.categoryId);
        if (!categoryId) continue;

        // Verify/map payment method to enum
        let paymentMethod = t.paymentMethod || "UPI";
        if (paymentMethod === "CARD") paymentMethod = "CARD";
        else if (paymentMethod === "CASH") paymentMethod = "CASH";
        else if (paymentMethod === "BANK_TRANSFER") paymentMethod = "BANK_TRANSFER";
        else if (paymentMethod === "WALLET") paymentMethod = "WALLET";
        else paymentMethod = "UPI";

        // Verify/map transaction type to enum
        let txType = t.type || "EXPENSE";
        if (!["INCOME", "EXPENSE", "SAVINGS", "INVESTMENT", "TRANSFER"].includes(txType)) {
          txType = "EXPENSE";
        }

        await this.prisma.transaction.upsert({
          where: { id: t.id },
          create: {
            id: t.id,
            userId: dbUserId,
            categoryId: categoryId,
            goalId: t.goalId || null,
            title: t.title,
            description: t.description || null,
            amount: t.amount?.amount || 0,
            type: txType as any,
            paymentMethod: paymentMethod as any,
            date: new Date(t.date),
            tags: t.tags || [],
            location: t.location || null,
            createdAt: t.createdAt ? new Date(t.createdAt) : new Date(),
            updatedAt: t.updatedAt ? new Date(t.updatedAt) : new Date(),
          },
          update: {
            categoryId: categoryId,
            goalId: t.goalId || null,
            title: t.title,
            description: t.description || null,
            amount: t.amount?.amount || 0,
            type: txType as any,
            paymentMethod: paymentMethod as any,
            date: new Date(t.date),
            tags: t.tags || [],
            location: t.location || null,
            updatedAt: new Date(),
          },
        });
      }
    }

    // 5. Upsert Budgets
    if (budgets && Array.isArray(budgets)) {
      for (const b of budgets) {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(b.id);
        if (!isUuid) continue;

        const categoryId = categoryMap.get(b.categoryId);
        if (!categoryId) continue;

        await this.prisma.budget.upsert({
          where: {
            userId_categoryId_month_year: {
              userId: dbUserId,
              categoryId: categoryId,
              month: b.month,
              year: b.year,
            },
          },
          create: {
            id: b.id,
            userId: dbUserId,
            categoryId: categoryId,
            limitAmount: b.limitAmount?.amount || 0,
            month: b.month,
            year: b.year,
            createdAt: b.createdAt ? new Date(b.createdAt) : new Date(),
            updatedAt: b.updatedAt ? new Date(b.updatedAt) : new Date(),
          },
          update: {
            limitAmount: b.limitAmount?.amount || 0,
            updatedAt: new Date(),
          },
        });
      }
    }

    // 6. Sync Settings
    if (settings) {
      await this.prisma.setting.upsert({
        where: { userId: dbUserId },
        create: {
          userId: dbUserId,
          currency: settings.currency || "INR",
          theme: settings.theme || "dark",
        },
        update: {
          currency: settings.currency || "INR",
          theme: settings.theme || "dark",
        },
      });
    }

    // 7. Retrieve all merged records to return to the client
    const dbTransactions = await this.prisma.transaction.findMany({
      where: { userId: dbUserId },
      include: { category: true },
    });
    const dbBudgets = await this.prisma.budget.findMany({
      where: { userId: dbUserId },
      include: { category: true },
    });
    const dbGoals = await this.prisma.goal.findMany({
      where: { userId: dbUserId },
    });
    const dbSettings = await this.prisma.setting.findUnique({
      where: { userId: dbUserId },
    });

    // Map database structures back to local storage models
    const clientTransactions = dbTransactions.map((t) => ({
      id: t.id,
      userId: clerkId,
      categoryId: t.category.name,
      goalId: t.goalId,
      title: t.title,
      description: t.description,
      amount: { amount: Number(t.amount), currency: dbSettings?.currency || "INR" },
      type: t.type,
      paymentMethod: t.paymentMethod,
      date: t.date.toISOString(),
      tags: t.tags,
      location: t.location,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    }));

    const clientBudgets = dbBudgets.map((b) => ({
      id: b.id,
      userId: clerkId,
      categoryId: b.category.name,
      limitAmount: { amount: Number(b.limitAmount), currency: dbSettings?.currency || "INR" },
      month: b.month,
      year: b.year,
      createdAt: b.createdAt.toISOString(),
      updatedAt: b.updatedAt.toISOString(),
    }));

    const clientGoals = dbGoals.map((g) => ({
      id: g.id,
      userId: clerkId,
      title: g.title,
      targetAmount: { amount: Number(g.targetAmount), currency: dbSettings?.currency || "INR" },
      currentAmount: { amount: Number(g.currentAmount), currency: dbSettings?.currency || "INR" },
      targetDate: g.targetDate ? g.targetDate.toISOString() : null,
      createdAt: g.createdAt.toISOString(),
      updatedAt: g.updatedAt.toISOString(),
    }));

    return {
      transactions: clientTransactions,
      budgets: clientBudgets,
      goals: clientGoals,
      settings: {
        currency: dbSettings?.currency || "INR",
        theme: dbSettings?.theme || "dark",
      },
    };
  }
}
