import NodeCache from 'node-cache';

import { ILoggerAdapter } from '@/infra/logger';
import { ApiException, HttpStatus } from '@/utils/exception';
import { NOT_IMPLEMENT_ERROR } from '@/utils/types/error';

import { ICacheAdapter } from '../adapter';
import { MemoryCacheKeyArgument, MemoryCacheSetType, MemoryCacheTTL, MemoryCacheValeuArgument } from './types';

export class MemoryCacheService implements ICacheAdapter<NodeCache> {
  client!: NodeCache;

  constructor(private readonly logger: ILoggerAdapter, private config?: NodeCache.Options) {}

  connect(): NodeCache {
    this.client = new NodeCache(this.config || { stdTTL: 3600, checkperiod: 3600 });
    this.logger.trace({ message: 'CacheMemory connected!' });
    return this.client;
  }

  isConnected(): void {
    if (!this.client) this.throwException('redis disconnected.');
  }

  mSet<TSet extends MemoryCacheSetType = MemoryCacheSetType>(model: TSet[]): boolean {
    return this.client.mset(model);
  }

  mGet(key: string[]): unknown {
    return this.client.mget(key);
  }

  has(key: string | number): boolean {
    return this.client.has(key);
  }

  set<TKey = MemoryCacheKeyArgument, TValeu = MemoryCacheValeuArgument, TConf = MemoryCacheTTL>(key: TKey, value: TValeu, config?: TConf): void {
    const setResult = this.client.set(key as MemoryCacheKeyArgument, value, config as MemoryCacheTTL);
    if (!setResult) this.throwException(`cache ${this.set.name} error: ${key} ${value}`);
  }

  del<TKey = MemoryCacheKeyArgument>(key: TKey): boolean {
    return !!this.client.del(key as MemoryCacheKeyArgument);
  }

  get<TKey = MemoryCacheKeyArgument>(key: TKey): unknown {
    return this.client.get(key as MemoryCacheKeyArgument);
  }

  pExpire<TCache = MemoryCacheKeyArgument>(key: TCache, ttl: number): boolean {
    return this.client.ttl(key as MemoryCacheKeyArgument, ttl);
  }

  hGet(): void {
    throw NOT_IMPLEMENT_ERROR;
  }

  hSet(): void {
    throw NOT_IMPLEMENT_ERROR;
  }

  hGetAll(): Promise<unknown> {
    throw NOT_IMPLEMENT_ERROR;
  }

  setMulti(): Promise<void> {
    throw NOT_IMPLEMENT_ERROR;
  }

  private throwException(error: string) {
    throw new ApiException(error, HttpStatus.INTERNAL_SERVER_ERROR, MemoryCacheService.name);
  }
}
