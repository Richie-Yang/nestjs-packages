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

@Injectable()
export class ErrorService {
  constructor() {}

  public ModuleCode: { [key: string]: string } = {
    UNAUTHORIZED: 'UNAUTHORIZED',
  };

  public ModuleError: ErrorCodeModule = {
    [this.ModuleCode.UNAUTHORIZED]: {
      message: 'unauthorized',
      errorCode: 'M00000',
    },
  };

  public throwError(
    errorCodeModule: string,
    options?: {
      customStatusCode?: StatusCodes;
      customMessage?: string | string[];
    },
  ) {
    const error = {
      status: options?.customStatusCode || StatusCodes.BAD_REQUEST,
      errorCode: _.get(errorCodeModule, 'errorCode'),
      message: options?.customMessage || _.get(errorCodeModule, 'message', ''),
    };
    throw new HttpException(error, error.status);
  }
}

// class newErrorService extends ErrorService {
//   constructor() {
//     super();
//   }
//   public ModuleCode: { [key: string]: string } = {
//     ...this.ModuleCode,
//     NEW_ERROR: 'NEW_ERROR',
//   };

//   public ModuleError: ErrorCodeModule = {
//     ...this.ModuleError,
//     [this.ModuleCode.NEW_ERROR]: {
//       message: 'new error',
//       errorCode: 'M00001',
//     },
//   };
// }
