import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { PrismaModule } from "./database/prisma.module";
import { SyncModule } from "./modules/sync/sync.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    EventEmitterModule.forRoot(),
    PrismaModule,
    SyncModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
