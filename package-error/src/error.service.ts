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
  INVALID_PAYLOAD = 'INVALID_PAYLOAD',
  JSON_STRINGIFY_ERROR = 'JSON_STRINGIFY_ERROR',
  JSON_PARSE_ERROR = 'JSON_PARSE_ERROR',
  DECRYPT_KEY_NOT_FOUND = 'DECRYPT_KEY_NOT_FOUND',
  LOCALE_NOT_FOUND = 'LOCALE_NOT_FOUND',
}

@Injectable()
export class ErrorService {
  constructor() {}

  public ModuleError: ErrorCodeModule = {
    [ModuleCode.UNAUTHORIZED]: {
      message: 'unauthorized',
      errorCode: 'M00000',
    },
    [ModuleCode.INVALID_PAYLOAD]: {
      message: 'invalid payload',
      errorCode: 'M00001',
    },
    [ModuleCode.JSON_STRINGIFY_ERROR]: {
      message: 'json stringify error',
      errorCode: 'M00002',
    },
    [ModuleCode.JSON_PARSE_ERROR]: {
      message: 'json parse error',
      errorCode: 'M00003',
    },
    [ModuleCode.DECRYPT_KEY_NOT_FOUND]: {
      message: 'decrypt key not found',
      errorCode: 'M00004',
    },
    [ModuleCode.LOCALE_NOT_FOUND]: {
      message: 'locale not found',
      errorCode: 'M00005',
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
