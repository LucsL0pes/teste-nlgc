import { Module } from '@nestjs/common';

import { AuthModule        } from './modules/auth/auth.module';
import { DatacenterModule  } from './modules/datacenter/datacenter.module';
import { SplashController  } from './modules/common/splash.controller';

@Module({
  imports: [
    AuthModule,
    DatacenterModule
  ],
  controllers: [SplashController]
})
export class AppModule {}
