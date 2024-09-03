// import { DynamicModule, Global, Module } from '@nestjs/common';
// import {
//   APP_NAME_KEY,
//   HOST_NAME_KEY,
//   LoggerService,
//   NODE_ENV_KEY,
// } from './logger.service';

// @Global()
// @Module({})
// export class LoggerModule {
//   static forRoot(
//     nodeEnv: string,
//     appName: string,
//     hostName: string,
//   ): DynamicModule {
//     return {
//       module: LoggerModule,
//       providers: [
//         {
//           provide: NODE_ENV_KEY,
//           useValue: nodeEnv,
//         },
//         {
//           provide: APP_NAME_KEY,
//           useValue: appName,
//         },
//         {
//           provide: HOST_NAME_KEY,
//           useValue: hostName,
//         },
//         LoggerService,
//       ],
//       exports: [LoggerService],
//     };
//   }
// }
