import { DynamicModule, Global, Module } from '@nestjs/common';
import { LoggerService } from './logger.service';
import {
  NODE_ENV_KEY,
  APP_NAME_KEY,
  HOST_NAME_KEY,
  LOGGER_OPTIONS_KEY,
} from './const';
import { LoggerOptions } from './type';

@Global()
@Module({})
export class LoggerModule {
  static forRoot(
    nodeEnv: string,
    appName: string,
    hostName: string,
    options?: LoggerOptions,
  ): DynamicModule {
    return {
      module: LoggerModule,
      providers: [
        {
          provide: NODE_ENV_KEY,
          useValue: nodeEnv,
        },
        {
          provide: APP_NAME_KEY,
          useValue: appName,
        },
        {
          provide: HOST_NAME_KEY,
          useValue: hostName,
        },
        {
          provide: LOGGER_OPTIONS_KEY,
          useValue: options,
        },
        LoggerService,
      ],
      exports: [LoggerService],
    };
  }
}
