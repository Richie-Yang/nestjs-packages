import { RedisService } from '@blackrelay/package-redis';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class AuthenticateService {
  constructor(@Inject(RedisService) private redisService: RedisService) {}

  async getUser(token: string) {
    const key = this.redisService.REDIS_KEY.SESSION(token);
    return this.redisService.get(key);
  }
}
