import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import * as _ from 'lodash';
import { StatusCodes } from 'http-status-codes';
import { ErrorService } from '@blackrelay/package-error';

import { AuthenticateService } from './authenticate.service';

export type AnyObject<T = any> = {
  [key: string]: T;
};

const TOKEN_PREFIX = 'Bearer';

@Injectable()
export class AuthenticateGuard implements CanActivate {
  static apiOption = { name: 'Authorization', required: true };

  constructor(
    @Inject(ErrorService)
    private err: ErrorService,
    @Inject(AuthenticateService)
    private authenticateService: AuthenticateService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    const bearerToken = _.get(request, 'headers.authorization') || '';
    const token = _.get(bearerToken.split(TOKEN_PREFIX), '[1]', '').trim();

    const userData = await this.authenticateService.getUser(token);
    if (!userData) {
      this.err.throwError(this.err.ModuleCode.UNAUTHORIZED, {
        customStatusCode: StatusCodes.UNAUTHORIZED,
      });
      return false;
    }

    request.user = userData;
    request.token = token;
    return true;
  }
}
