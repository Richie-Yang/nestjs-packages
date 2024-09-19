import { DynamicModule, Global, Module } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

export { AsyncLocalStorage };

@Global()
@Module({})
export class AlsModule {
  static forRoot(): DynamicModule {
    return {
      module: AlsModule,
      providers: [
        {
          provide: AsyncLocalStorage,
          useValue: new AsyncLocalStorage(),
        },
      ],
      exports: [AsyncLocalStorage],
    };
  }
}
