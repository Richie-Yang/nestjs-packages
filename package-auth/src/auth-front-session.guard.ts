import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import * as _ from 'lodash';
import { ErrorService, ModuleCode } from '@blackrelay/package-error';

import { AuthenticateService } from './authenticate.service';
import { RedisService } from '@blackrelay/package-redis';

export type AnyObject<T = any> = {
  [key: string]: T;
};

const TOKEN_PREFIX = 'Bearer';

@Injectable()
export class AuthFrontSessionGuard implements CanActivate {
  static apiOption = { name: 'Authorization', required: true };

  constructor(
    @Inject(ErrorService)
    private err: ErrorService,
    @Inject(AuthenticateService)
    private authenticateService: AuthenticateService,
    @Inject(RedisService)
    private redisService: RedisService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    const bearerToken = _.get(request, 'headers.authorization') || '';
    const token = _.get(bearerToken.split(TOKEN_PREFIX), '[1]', '').trim();

    const key = this.redisService.REDIS_KEY.SESSION.AUTH_FRONT(token);
    const userData = await this.authenticateService.getSession(key);
    if (!userData) {
      this.err.throwError(this.err.ModuleError[ModuleCode.UNAUTHORIZED]);
      return false;
    }

    request.user = userData;
    request.token = token;
    return true;
  }
}
