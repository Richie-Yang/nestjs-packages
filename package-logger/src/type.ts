export type AnyObject<T = any> = {
  [key: string]: T;
};

export type ErrorLogPattern = {
  stack: string[];
  detail: string;
};

export type LoggerOptions = {
  local?: {
    dirname: string;
    filename?: string;
    datePattern?: string;
    maxSize?: string;
    maxFiles?: string;
  };
  fluentd?: {
    tagPrefix: string;
    host: string;
    port: number;
    timeout: number;
  };
};
