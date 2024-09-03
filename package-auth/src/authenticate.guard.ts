import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { throwError, ModuleCode, ModuleError } from '@blackrelay/package-error';
import * as _ from 'lodash';

import { AuthenticateService } from './authenticate.service';
import { StatusCodes } from 'http-status-codes';

export type AnyObject<T = any> = {
  [key: string]: T;
};

const TOKEN_PREFIX = 'Bearer';

@Injectable()
export class AuthenticateGuard implements CanActivate {
  static apiOption = { name: 'Authorization', required: true };

  constructor(
    @Inject(AuthenticateService)
    private authenticateService: AuthenticateService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    const bearerToken = _.get(request, 'headers.authorization') || '';
    const token = _.get(bearerToken.split(TOKEN_PREFIX), '[1]', '').trim();

    const userData = await this.authenticateService.getUser(token);
    if (!userData) {
      throwError(ModuleError[ModuleCode.UNAUTHORIZED], {
        customStatusCode: StatusCodes.UNAUTHORIZED,
      });
      return false;
    }

    request.user = userData;
    return true;
  }
}
