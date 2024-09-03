import { HttpException } from '@nestjs/common';
import { StatusCodes } from 'http-status-codes';
import * as _ from 'lodash';

type CodeMessage = {
  errorCode: string;
  message: string | string[];
  [key: string]: any;
};

type ErrorCodeModule<T extends string> = {
  [key in T]: CodeMessage;
};

export enum ModuleCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
}

export const ModuleError: ErrorCodeModule<ModuleCode> = {
  [ModuleCode.UNAUTHORIZED]: {
    message: 'unauthorized',
    errorCode: 'M00000',
  },
};

export function throwError<T extends string>(
  errorCodeModule: ErrorCodeModule<T>,
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
