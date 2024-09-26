import { RedisService } from '@blackrelay/package-redis';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class AuthenticateService {
  constructor(@Inject(RedisService) private redisService: RedisService) {}

  async getSession(key: string) {
    return this.redisService.get(key);
  }
}
