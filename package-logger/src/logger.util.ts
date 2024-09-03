import * as winston from 'winston';
import * as path from 'path';
import * as _ from 'lodash';
import { format } from 'winston';
import { asyncLocalStorage } from '@blackrelay/package-als';
import { AnyObject, ErrorLogPattern } from './type';
import { NodeEnv, LogLevels } from './variables';
import { StreamOptions } from 'morgan';

const defaultLogPattern = {
  sourceIP: null,
  requestId: null,
  userId: null,
  env: process.env.NODE_ENV,
  app: process.env.APP_NAME,
  host: process.env.HOST_NAME,
};

const { combine, timestamp, prettyPrint } = format;

const transports: winston.transport[] = [new winston.transports.Console()];

if (process.env.NODE_ENV === NodeEnv.DEV) {
  transports.push(
    ...[
      new winston.transports.File({
        filename: path.join(__dirname, '../../log/error.log'),
        level: LogLevels.ERROR,
      }),
      new winston.transports.File({
        filename: path.join(__dirname, '../../log/combined.log'),
      }),
    ],
  );
}

function generalFormat() {
  const format = winston.format((info: winston.Logform.TransformableInfo) => {
    return {
      ...info,
      ...(asyncLocalStorage.getStore() as AnyObject),
    };
  });
  return format();
}

function customFormat() {
  const format = winston.format((info: winston.Logform.TransformableInfo) => {
    return {
      ...info,
      ...(asyncLocalStorage.getStore() as AnyObject),
      message: {
        ...info.message,
        function: _.get(info, 'message.function', ''),
      },
    };
  });
  return format();
}

export function getMorganFormat(tokens, req, res) {
  return JSON.stringify({
    sourceIP: tokens['remote-addr'](req, res),
    method: tokens.method(req, res),
    url: tokens.url(req, res),
    headers: req.headers,
    referrers: tokens.referrer(req, res),
    userAgent: tokens['user-agent'](req, res),
    status: tokens.status(req, res),
    responseLength: tokens.res(req, res, 'content-length'),
    responseTime: `${tokens['response-time'](req, res)} ms`,
  });
}

export const logger = (() => {
  const level =
    process.env.NODE_ENV === NodeEnv.DEV ? LogLevels.DEBUG : LogLevels.INFO;

  const winstonLogger = winston.createLogger({
    level,
    format: combine(timestamp(), customFormat(), prettyPrint()),
    defaultMeta: {},
    transports,
  });

  function _logHelper(level: LogLevels) {
    return (detail: AnyObject | string) => {
      const stackTraces = `${new Error().stack || ''}`.split(/\sat\s/);
      const path = _.get(stackTraces, `${[stackTraces.length - 1]}`, '');
      return winstonLogger[level]({
        message: { detail, function: path },
        ...defaultLogPattern,
      });
    };
  }

  return {
    ...winstonLogger,
    info: _logHelper(LogLevels.INFO),
    debug: _logHelper(LogLevels.DEBUG),
    warn: _logHelper(LogLevels.WARN),
    error: _logHelper(LogLevels.ERROR),
  };
})();

export const errorLogger = (() => {
  const winstonLogger = winston.createLogger({
    level: LogLevels.ERROR,
    format: combine(timestamp(), generalFormat(), prettyPrint()),
    defaultMeta: {},
    transports,
  });
  return {
    error: (pattern: ErrorLogPattern) =>
      winstonLogger.error({ message: pattern, ...defaultLogPattern }),
  };
})();

export const requestLogger = (() => {
  const winstonLogger = winston.createLogger({
    level: LogLevels.INFO,
    format: combine(timestamp(), generalFormat(), prettyPrint()),
    defaultMeta: {},
    transports,
  });
  return {
    write: (str: string) => {
      winstonLogger.info(JSON.parse(str), defaultLogPattern);
    },
  } as StreamOptions;
})();
