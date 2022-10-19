import { MemoryCacheSetType } from './memory/types';
import { RedisCacheKeyArgument, RedisCacheKeyValue, RedisCacheValeuArgument } from './redis/types';

export interface ICacheAdapter<T = object> {
  client: T;

  isConnected(): Promise<void> | void;

  connect(): Promise<T> | T;

  set<
    TKey extends RedisCacheKeyArgument = RedisCacheKeyArgument,
    TValeu extends RedisCacheValeuArgument = RedisCacheValeuArgument,
    TConf extends object = object,
  >(
    key: TKey,
    value: TValeu,
    config?: TConf,
  ): Promise<void> | void;

  del<TKey extends RedisCacheKeyArgument = RedisCacheKeyArgument>(key: TKey): Promise<void> | boolean;

  get<TKey extends RedisCacheKeyArgument = RedisCacheKeyArgument>(key: TKey): Promise<unknown> | unknown;

  setMulti(redisList?: RedisCacheKeyValue[]): Promise<void>;

  pExpire<PCache extends RedisCacheKeyArgument = RedisCacheKeyArgument>(key: PCache, miliseconds: number): Promise<void> | boolean;

  hGet<TKey extends RedisCacheKeyArgument = RedisCacheKeyArgument, TArs extends RedisCacheKeyArgument = RedisCacheKeyArgument>(
    key?: TKey,
    field?: TArs,
  ): Promise<unknown | unknown[]> | void;

  hSet<
    TKey extends RedisCacheKeyArgument = RedisCacheKeyArgument,
    TArgs extends RedisCacheKeyArgument = RedisCacheKeyArgument,
    TValue extends RedisCacheValeuArgument = RedisCacheValeuArgument,
  >(
    key?: TKey,
    field?: TArgs,
    value?: TValue,
  ): Promise<number> | void;

  hGetAll<TKey extends RedisCacheKeyArgument = RedisCacheKeyArgument>(key: TKey): Promise<unknown | unknown[]> | void;

  mSet<TSet extends MemoryCacheSetType = MemoryCacheSetType>(model?: TSet[]): boolean;

  mGet(key?: string[]): unknown | null;

  has(key?: string | number): boolean;
}
