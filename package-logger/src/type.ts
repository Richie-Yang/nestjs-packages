export type AnyObject<T = any> = {
  [key: string]: T;
};

export type ErrorLogPattern = {
  stack: string[];
  detail: string;
};
