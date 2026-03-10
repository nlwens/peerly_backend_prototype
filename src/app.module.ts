import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { RequestsModule } from './requests/requests.module';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [UsersModule, RequestsModule, PrismaModule],
  controllers: [AppController],
})
export class AppModule {}
