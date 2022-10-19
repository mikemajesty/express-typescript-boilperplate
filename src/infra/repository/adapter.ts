import { RemovedModel, UpdatedModel } from './types';

export abstract class IRepository<T> {
  abstract isConnected(): Promise<void>;

  abstract create<TOptions>(document: object, saveOptions?: TOptions): Promise<T>;

  abstract findById(id: string | number): Promise<T | null>;

  abstract findAll(): Promise<T[]>;

  abstract find<TQuery, TOptions>(filter: TQuery, options?: TOptions | null): Promise<T[] | null>;

  abstract remove<TQuery>(filter: TQuery): Promise<RemovedModel>;

  abstract findOne<TQuery, TOptions>(filter: TQuery, options?: TOptions): Promise<T | null>;

  abstract updateOne<TQuery, TUpdate, TOptions>(filter: TQuery, updated: TUpdate, options?: TOptions): Promise<UpdatedModel>;

  abstract updateMany<TQuery, TUpdate, TOptions>(filter: TQuery, updated: TUpdate, options?: TOptions): Promise<UpdatedModel>;
}
