import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { RequestsModule } from './requests/requests.module';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [UsersModule, RequestsModule, PrismaModule, AuthModule],
  controllers: [AppController],
})
export class AppModule {}
