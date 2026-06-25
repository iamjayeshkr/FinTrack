import { User } from "../../domain/entities/user";

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByClerkId(clerkId: string): Promise<User | null>;
  save(user: User): Promise<void>;
  delete(id: string): Promise<void>;
}
