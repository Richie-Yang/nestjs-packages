import { Injectable, HttpException } from '@nestjs/common';
import { StatusCodes } from 'http-status-codes';
import * as _ from 'lodash';

export type CodeMessage = {
  errorCode: string;
  message: string | string[];
  [key: string]: any;
};

export type ErrorCodeModule = {
  [key: string]: CodeMessage;
};

export enum ModuleCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
}

@Injectable()
export class ErrorService {
  constructor() {}

  public ModuleError: ErrorCodeModule = {
    [ModuleCode.UNAUTHORIZED]: {
      message: 'unauthorized',
      errorCode: 'M00000',
    },
  };

  public throwError(
    codeMessage: CodeMessage,
    options?: {
      customStatusCode?: StatusCodes;
      customMessage?: string | string[];
    },
  ) {
    const error = {
      status: options?.customStatusCode || StatusCodes.BAD_REQUEST,
      errorCode: _.get(codeMessage, 'errorCode'),
      message: options?.customMessage || _.get(codeMessage, 'message', ''),
    };
    throw new HttpException(error, error.status);
  }
}
