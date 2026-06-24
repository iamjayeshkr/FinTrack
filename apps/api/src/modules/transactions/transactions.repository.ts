import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { CreateTransactionDto } from "shared-types";

@Injectable()
export class TransactionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateTransactionDto) {
    return this.prisma.transaction.create({
      data: {
        userId,
        type: dto.type,
        amount: dto.amount,
        title: dto.title,
        description: dto.notes || null,
        categoryId: dto.categoryId || "",
        paymentMethod: dto.paymentMethod || "UPI",
        tags: dto.tags || [],
        date: new Date(dto.occurredAt),
      },
    });
  }

  async findMany(userId: string) {
    return this.prisma.transaction.findMany({
      where: {
        userId,
      },
      orderBy: {
        date: "desc",
      },
    });
  }

  async delete(id: string) {
    return this.prisma.transaction.delete({
      where: { id },
    });
  }
}
