import { createClient, RedisClientOptions, RedisClientType } from 'redis';

import { ILoggerAdapter } from '@/infra/logger';
import { ApiException, HttpStatus } from '@/utils/exception';
import { NOT_IMPLEMENT_ERROR } from '@/utils/types/error';

import { ICacheAdapter } from '../adapter';
import { RedisCacheKeyArgument, RedisCacheKeyValue, RedisCacheValeuArgument } from './types';

export class RedisCacheService implements ICacheAdapter<RedisClientType> {
  readonly client: RedisClientType;

  constructor(private readonly config: RedisClientOptions, private readonly logger: ILoggerAdapter) {
    this.client = createClient(this.config) as RedisClientType;
  }

  async isConnected(): Promise<void> {
    const ping = await this.client.ping();
    if (ping !== 'PONG') this.throwException('redis disconnected.');
  }

  async connect(): Promise<RedisClientType> {
    await this.client.connect();
    this.logger.trace({ message: 'Redis connected!' });
    return this.client;
  }

  async set(key: RedisCacheKeyArgument, value: RedisCacheValeuArgument, config?: any): Promise<void> {
    const setResult = await this.client.set(key, value, config);
    if (setResult !== 'OK') this.throwException(`cache ${this.set.name} error: ${key} ${value}`);
  }

  async get(key: RedisCacheKeyArgument): Promise<unknown> {
    const getResult = await this.client.get(key);
    if (!getResult) this.logger.warn({ message: `key: ${key} not found.`, context: RedisCacheService.name });

    return getResult;
  }

  async del(key: RedisCacheKeyArgument): Promise<void> {
    const deleted = await this.client.del(key);
    if (!deleted) this.throwException(`cache key: ${key} not deleted`);
  }

  async setMulti(redisList: RedisCacheKeyValue[]): Promise<void> {
    const multi = this.client.multi();

    for (const model of redisList) {
      multi.rPush(model.key, model.value);
    }

    await multi.exec();
  }

  async pExpire(key: RedisCacheKeyArgument, miliseconds: number): Promise<void> {
    const expired = await this.client.pExpire(key, miliseconds);
    if (!expired) this.throwException(`set expire error key: ${key}`);
  }

  async hGet<TKey extends RedisCacheKeyArgument = RedisCacheKeyArgument, TArs extends RedisCacheKeyArgument = RedisCacheKeyArgument>(
    key?: TKey,
    field?: TArs,
  ): Promise<unknown> {
    return await this.client.hGet(key as RedisCacheKeyArgument, field as RedisCacheKeyArgument);
  }

  async hSet<Tkey = RedisCacheKeyArgument, TArgs = RedisCacheKeyArgument, TValue = RedisCacheValeuArgument>(
    key?: Tkey,
    field?: TArgs,
    value?: TValue,
  ): Promise<number> {
    return await this.client.hSet(key as RedisCacheKeyArgument, field as RedisCacheKeyArgument, value as RedisCacheValeuArgument);
  }

  async hGetAll(key: RedisCacheKeyArgument): Promise<unknown | unknown[]> {
    return await this.client.hGetAll(key);
  }

  mSet(): boolean {
    throw NOT_IMPLEMENT_ERROR;
  }

  mGet(): unknown {
    throw NOT_IMPLEMENT_ERROR;
  }

  has(): boolean {
    throw NOT_IMPLEMENT_ERROR;
  }

  private throwException(error: string) {
    throw new ApiException(error, HttpStatus.INTERNAL_SERVER_ERROR, RedisCacheService.name);
  }
}
