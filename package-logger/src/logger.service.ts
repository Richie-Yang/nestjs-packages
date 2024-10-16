import {
  Inject,
  Injectable,
  LoggerService as NestLoggerService,
} from '@nestjs/common';
import * as winston from 'winston';
import { format } from 'winston';
import { StreamOptions } from 'morgan';
import * as _ from 'lodash';
import { FluentClient, FluentClientOptions } from '@fluent-org/logger';

import { LogLevels, NodeEnv } from './variables';
import { AnyObject, ErrorLogPattern, LoggerOptions } from './type';
import { AsyncLocalStorage } from '@blackrelay/package-als';
import {
  NODE_ENV_KEY,
  APP_NAME_KEY,
  HOST_NAME_KEY,
  LOGGER_OPTIONS_KEY,
  MASK_KEYWORD_LIST,
} from './const';

import 'winston-daily-rotate-file';
import { FluentTransport } from './plugins';

@Injectable()
export class LoggerService implements NestLoggerService {
  public transports: winston.transport[] = [new winston.transports.Console()];
  public defaultLogger: winston.Logger;
  public errorLogger: winston.Logger;
  public requestLogger: StreamOptions;
  public fluentdLogger: FluentClient;

  constructor(
    public asyncLocalStorage: AsyncLocalStorage<AnyObject>,
    @Inject(NODE_ENV_KEY) public nodeEnv: string,
    @Inject(APP_NAME_KEY) public appName: string,
    @Inject(HOST_NAME_KEY) public hostName: string,
    @Inject(LOGGER_OPTIONS_KEY) public options?: LoggerOptions,
  ) {
    if (this.nodeEnv === NodeEnv.DEV) {
      this.transports.push(
        ...[
          // new winston.transports.File({
          //   filename: path.join(__dirname, '../../log/error.log'),
          //   level: LogLevels.ERROR,
          // }),
          // new winston.transports.File({
          //   filename: path.join(__dirname, '../../log/combined.log'),
          // }),
        ],
      );
    }

    if (this.options?.local) {
      this.transports.push(
        new winston.transports.DailyRotateFile(this.options.local),
      );
    }

    if (this.options?.fluentd) {
      const { host, port, timeout, tagPrefix } = this.options.fluentd;
      const fluentdOptions: FluentClientOptions = {
        socket: { host, port, timeout },
      };
      this.fluentdLogger = new FluentClient(tagPrefix, fluentdOptions);
      this.transports.push(
        new FluentTransport({ fluentClient: this.fluentdLogger }),
      );
    }

    const { combine, timestamp, prettyPrint } = format;
    const level =
      this.nodeEnv === NodeEnv.DEV ? LogLevels.DEBUG : LogLevels.INFO;
    this.defaultLogger = winston.createLogger({
      level,
      format: combine(timestamp(), this.defaultFormat(), prettyPrint()),
      defaultMeta: {},
      transports: this.transports,
    });
    this.errorLogger = winston.createLogger({
      level: LogLevels.ERROR,
      format: combine(timestamp(), this.errorFormat(), prettyPrint()),
      defaultMeta: {},
      transports: this.transports,
    });
    this.requestLogger = (() => {
      const winstonLogger = winston.createLogger({
        level: LogLevels.INFO,
        format: combine(timestamp(), this.defaultFormat(), prettyPrint()),
        defaultMeta: {},
        transports: this.transports,
      });
      return {
        write: (str: string) => {
          winstonLogger.info(JSON.parse(str), this.getDefaultLogPattern());
        },
      } as StreamOptions;
    })();
  }

  log = this.defaultLogHelper(LogLevels.INFO);
  debug = this.defaultLogHelper(LogLevels.DEBUG);
  warn = this.defaultLogHelper(LogLevels.WARN);
  error = this.defaultLogHelper(LogLevels.ERROR);

  errorWithStack(pattern: ErrorLogPattern) {
    return this.errorLogger.error({
      message: pattern,
      ...this.getDefaultLogPattern(),
    });
  }

  private getDefaultLogPattern() {
    return {
      sourceIP: null,
      requestId: null,
      userId: null,
      env: this.nodeEnv,
      app: this.appName,
      host: this.hostName,
    };
  }

  private defaultFormat() {
    const format = winston.format((info: winston.Logform.TransformableInfo) => {
      return {
        ...info,
        ...(this.asyncLocalStorage.getStore() as AnyObject),
        message: {
          ...info.message,
          function: _.get(info, 'message.function', ''),
        },
      };
    });
    return format();
  }

  private errorFormat() {
    const format = winston.format((info: winston.Logform.TransformableInfo) => {
      return {
        ...info,
        ...(this.asyncLocalStorage.getStore() as AnyObject),
      };
    });
    return format();
  }

  public morganFormat(tokens, req, res) {
    const maskSensitiveData = (obj: any): any => {
      if (_.isArray(obj)) return obj.map((item) => maskSensitiveData(item));
      if (_.isObject(obj) && !_.isArray(obj)) {
        return _.mapValues(obj, (value, key) => {
          if (MASK_KEYWORD_LIST.includes(key)) return '***';
          return maskSensitiveData(value);
        });
      }
      return obj;
    };
    const body =
      _.get(req, 'nodeEnv', null) !== NodeEnv.PROD
        ? req.body || {}
        : maskSensitiveData(req.body || {});

    return JSON.stringify({
      sourceIP: tokens['remote-addr'](req, res),
      method: tokens.method(req, res),
      url: tokens.url(req, res),
      headers: req.headers,
      body,
      referrers: tokens.referrer(req, res),
      userAgent: tokens['user-agent'](req, res),
      status: tokens.status(req, res),
      responseLength: tokens.res(req, res, 'content-length'),
      responseTime: `${tokens['response-time'](req, res)} ms`,
    });
  }

  private defaultLogHelper(level: LogLevels) {
    return (detail: AnyObject | string) => {
      const stackTraces = `${new Error().stack || ''}`.split(/\sat\s/);
      const path = _.get(stackTraces, `${[stackTraces.length - 1]}`, '');
      return this.defaultLogger[level]({
        message: { detail, function: path },
        ...this.getDefaultLogPattern(),
      });
    };
  }
}
