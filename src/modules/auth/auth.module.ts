// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

@Module({
  controllers: [AuthController],
  providers  : [AuthService],
  exports    : [AuthService]          // 👈  torna-o visível para outros módulos
})
export class AuthModule {}
