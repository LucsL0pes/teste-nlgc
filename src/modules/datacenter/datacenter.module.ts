// src/datacenter/datacenter.module.ts
import { Module } from '@nestjs/common';
import { UsuariosController } from './controller/usuarios.controller';
import { UsuariosService } from './service/usuarios.service';
import { AuthModule } from '../auth/auth.module';   // 👈  importa o módulo que expõe AuthService

@Module({
  imports    : [AuthModule],          // 👈  agora AuthService está disponível
  controllers: [UsuariosController],
  providers  : [UsuariosService],
})
export class DatacenterModule {}
