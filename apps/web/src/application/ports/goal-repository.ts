import { Goal } from "../../domain/entities/goal";

export interface IGoalRepository {
  findById(id: string): Promise<Goal | null>;
  findByUserId(userId: string): Promise<Goal[]>;
  save(goal: Goal): Promise<void>;
  delete(id: string): Promise<void>;
}
