import { DynamicModule, Global, Module } from '@nestjs/common';
import { AuthenticateGuard } from './authenticate.guard';
import { AuthenticateService } from './authenticate.service';

@Global()
@Module({})
export class AuthModule {
  static register(): DynamicModule {
    return {
      module: AuthModule,
      providers: [
        {
          provide: AuthenticateGuard,
          useClass: AuthenticateGuard,
        },
        {
          provide: AuthenticateService,
          useClass: AuthenticateService,
        },
      ],
      exports: [AuthenticateGuard, AuthenticateService],
    };
  }
}
