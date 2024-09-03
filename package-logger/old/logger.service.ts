// import {
//   Inject,
//   Injectable,
//   LoggerService as NestLoggerService,
// } from '@nestjs/common';
// import * as winston from 'winston';
// import { format } from 'winston';

// import * as _ from 'lodash';
// import { StreamOptions } from 'morgan';
// import { LogLevels, NodeEnv } from './variables';
// import { AnyObject, ErrorLogPattern } from './type';
// import { AsyncLocalStorage } from '@blackrelay/package-als';

// export const NODE_ENV_KEY = 'NODE_ENV';
// export const REDIS_URL_KEY = 'REDIS_URL';
// export const APP_NAME_KEY = 'APP_NAME';
// export const HOST_NAME_KEY = 'HOST_NAME';

// @Injectable()
// export class LoggerService implements NestLoggerService {
//   private transports: winston.transport[] = [new winston.transports.Console()];
//   private defaultLogger: winston.Logger;
//   private errorLogger: winston.Logger;
//   public requestLogger: StreamOptions;

//   constructor(
//     private asyncLocalStorage: AsyncLocalStorage<AnyObject>,
//     @Inject(NODE_ENV_KEY) private nodeEnv: string,
//     @Inject(APP_NAME_KEY) private appName: string,
//     @Inject(HOST_NAME_KEY) private hostName: string,
//   ) {
//     if (this.nodeEnv === NodeEnv.DEV) {
//       this.transports.push(
//         ...[
//           // new winston.transports.File({
//           //   filename: path.join(__dirname, '../../log/error.log'),
//           //   level: LogLevels.ERROR,
//           // }),
//           // new winston.transports.File({
//           //   filename: path.join(__dirname, '../../log/combined.log'),
//           // }),
//         ],
//       );
//     }

//     const { combine, timestamp, prettyPrint } = format;
//     const level =
//       this.nodeEnv === NodeEnv.DEV ? LogLevels.DEBUG : LogLevels.INFO;
//     this.defaultLogger = winston.createLogger({
//       level,
//       format: combine(timestamp(), this.defaultFormat(), prettyPrint()),
//       defaultMeta: {},
//       transports: this.transports,
//     });
//     this.errorLogger = winston.createLogger({
//       level: LogLevels.ERROR,
//       format: combine(timestamp(), this.errorFormat(), prettyPrint()),
//       defaultMeta: {},
//       transports: this.transports,
//     });
//     this.requestLogger = (() => {
//       const winstonLogger = winston.createLogger({
//         level: LogLevels.INFO,
//         format: combine(timestamp(), this.defaultFormat(), prettyPrint()),
//         defaultMeta: {},
//         transports: this.transports,
//       });
//       return {
//         write: (str: string) => {
//           winstonLogger.info(JSON.parse(str), this.getDefaultLogPattern());
//         },
//       } as StreamOptions;
//     })();
//   }

//   log = this.defaultLogHelper(LogLevels.INFO);
//   debug = this.defaultLogHelper(LogLevels.DEBUG);
//   warn = this.defaultLogHelper(LogLevels.WARN);
//   error = this.defaultLogHelper(LogLevels.ERROR);

//   errorWithStack(pattern: ErrorLogPattern) {
//     return this.errorLogger.error({
//       message: pattern,
//       ...this.getDefaultLogPattern(),
//     });
//   }

//   private getDefaultLogPattern() {
//     return {
//       sourceIP: null,
//       requestId: null,
//       userId: null,
//       env: this.nodeEnv,
//       app: this.appName,
//       host: this.hostName,
//     };
//   }

//   private defaultFormat() {
//     const format = winston.format((info: winston.Logform.TransformableInfo) => {
//       return {
//         ...info,
//         ...(this.asyncLocalStorage.getStore() as AnyObject),
//         message: {
//           ...info.message,
//           function: _.get(info, 'message.function', ''),
//         },
//       };
//     });
//     return format();
//   }

//   private errorFormat() {
//     const format = winston.format((info: winston.Logform.TransformableInfo) => {
//       return {
//         ...info,
//         ...(this.asyncLocalStorage.getStore() as AnyObject),
//       };
//     });
//     return format();
//   }

//   public morganFormat(tokens, req, res) {
//     return JSON.stringify({
//       sourceIP: tokens['remote-addr'](req, res),
//       method: tokens.method(req, res),
//       url: tokens.url(req, res),
//       headers: req.headers,
//       referrers: tokens.referrer(req, res),
//       userAgent: tokens['user-agent'](req, res),
//       status: tokens.status(req, res),
//       responseLength: tokens.res(req, res, 'content-length'),
//       responseTime: `${tokens['response-time'](req, res)} ms`,
//     });
//   }

//   private defaultLogHelper(level: LogLevels) {
//     return (detail: AnyObject | string) => {
//       const stackTraces = `${new Error().stack || ''}`.split(/\sat\s/);
//       const path = _.get(stackTraces, `${[stackTraces.length - 1]}`, '');
//       return this.defaultLogger[level]({
//         message: { detail, function: path },
//         ...this.getDefaultLogPattern(),
//       });
//     };
//   }
// }
