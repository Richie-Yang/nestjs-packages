import { DynamicModule, Global, Module } from '@nestjs/common';
import { AuthFrontSessionGuard } from './auth-front-session.guard';
import { AuthenticateService } from './authenticate.service';
import { AuthBackSessionGuard } from './auth-back-session.guard';

@Global()
@Module({})
export class AuthModule {
  static register(): DynamicModule {
    return {
      module: AuthModule,
      providers: [
        {
          provide: AuthFrontSessionGuard,
          useClass: AuthFrontSessionGuard,
        },
        {
          provide: AuthBackSessionGuard,
          useClass: AuthBackSessionGuard,
        },
        {
          provide: AuthenticateService,
          useClass: AuthenticateService,
        },
      ],
      exports: [
        AuthFrontSessionGuard,
        AuthBackSessionGuard,
        AuthenticateService,
      ],
    };
  }
}
