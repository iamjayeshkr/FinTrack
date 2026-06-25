import { Controller, Post, Body, HttpCode, HttpStatus } from "@nestjs/common";
import { SyncService } from "./sync.service";

@Controller("sync")
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async sync(@Body() body: any) {
    try {
      const result = await this.syncService.syncUserData(body);
      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      console.error("Backend Sync error:", error);
      return {
        success: false,
        message: error.message || "Failed to synchronize user data.",
      };
    }
  }
}

