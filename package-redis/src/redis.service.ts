import { createClient, RedisClientType } from 'redis';
import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';

type AnyObject<T = any> = {
  [key: string]: T;
};

enum NodeEnv {
  TEST = 'test',
  LOCAL = 'local',
  DEV = 'dev',
  PROD_LIKE = 'prodLike',
  PROD = 'prod',
}

export const NODE_ENV_KEY = 'NODE_ENV';
export const REDIS_URL_KEY = 'REDIS_URL';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: RedisClientType;
  public REDIS_KEY = {
    SESSION: (() => {
      const PREFIX = 'SESSION';
      return {
        AUTH_FRONT: (token: string) => `${PREFIX}:AUTH_FRONT:${token}`,
        AUTH_BACK: (token: string) => `${PREFIX}:AUTH_BACK:${token}`,
      };
    })(),
    AUTH: (() => {
      const PREFIX = 'AUTH';
      return {
        VERIFY_KEY: (token: string) => `${PREFIX}:VERIFY_EMAIL:${token}`,
        RESET_KEY: (token: string) => `${PREFIX}:RESET_PASSWORD:${token}`,
      };
    })(),
    ORDER: (orderId: string) => `ORDER:${orderId}`,
  };

  constructor(
    @Inject(NODE_ENV_KEY) private nodeEnv: string,
    @Inject(REDIS_URL_KEY) private redisUrl: string,
  ) {
    const redisConfig = {
      url: this.redisUrl,
    };

    if (this.nodeEnv !== NodeEnv.LOCAL) {
      // Object.assign(redisConfig, {
      //   socket: {
      //     tls: true,
      //   },
      // });
    }

    this.client = createClient(redisConfig);

    this.client.on('error', (error) => {
      console.log(`Redis: error occurs and detail is ${error}`);
      process.exit(1);
    });

    this.client.on('connect', () => {
      console.log('Redis: successfully connected to Redis');
    });
  }

  async onModuleInit() {
    await this.client.connect();

    console.log(`Redis: URL is ${this.redisUrl}`);
    if (!this.client.isReady) {
      console.log('Redis: failed to connect to Redis');
      process.exit(1);
    }
  }

  async onModuleDestroy() {
    await this.client.disconnect();
    console.log(`Redis: disconnected and status is ${this.client.isReady}`);
  }

  async set(key: string, value: AnyObject | string, ttl: number) {
    let stringifiedValue;

    if (typeof value === 'object') {
      try {
        stringifiedValue = JSON.stringify(value);
      } catch (err) {
        console.log(err);
      }
    } else stringifiedValue = value;

    await this.client.set(key, stringifiedValue, { EX: ttl });
  }

  async get(key: string): Promise<AnyObject | null | void> {
    const value = await this.client.get(key);
    if (!value) return null;
    let parsedValue = null;
    try {
      parsedValue = JSON.parse(value);
    } catch (err) {
      console.log(err);
    }
    return parsedValue;
  }

  async del(key: string) {
    return this.client.del(key);
  }

  async getWithWildcard(pattern: string) {
    const result: { [key: string]: any } = {};

    for await (const key of this.client.scanIterator({ MATCH: pattern })) {
      const value = await this.client.get(key);
      if (value) {
        try {
          result[key] = JSON.parse(value);
        } catch (err) {
          console.log(`Error parsing value for key ${key}:`, err);
          result[key] = value;
        }
      }
    }
    return result;
  }
}
