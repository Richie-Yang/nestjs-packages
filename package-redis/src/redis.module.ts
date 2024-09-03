import { DynamicModule, Global, Module } from '@nestjs/common';
import { NODE_ENV_KEY, REDIS_URL_KEY, RedisService } from './redis.service';

@Global()
@Module({})
export class RedisModule {
  static forRoot(nodeEnv: string, redisUrl: string): DynamicModule {
    return {
      module: RedisModule,
      providers: [
        {
          provide: NODE_ENV_KEY,
          useValue: nodeEnv,
        },
        {
          provide: REDIS_URL_KEY,
          useValue: redisUrl,
        },
        {
          provide: RedisService,
          useClass: RedisService,
        },
      ],
      exports: [RedisService],
    };
  }
}
