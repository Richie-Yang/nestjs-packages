import DailyRotateFile = require('winston-daily-rotate-file');

export type AnyObject<T = any> = {
  [key: string]: T;
};

export type ErrorLogPattern = {
  stack: string[];
  detail: string;
};

export type LoggerOptions = {
  local?: DailyRotateFile.DailyRotateFileTransportOptions;
  fluentd?: {
    tagPrefix: string;
    host: string;
    port: number;
    timeout: number;
  };
};
