import { FilterQuery, Model, QueryOptions, SaveOptions, UpdateQuery, UpdateWithAggregationPipeline } from 'mongoose';
import { Document } from 'mongoose';

import { ApiException, HttpStatus } from '@/utils/exception';

import { IRepository } from './adapter';
import { CreatedModel, RemovedModel, UpdatedModel } from './types';

export abstract class Repository<T extends Document> implements IRepository<T> {
  model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async isConnected(): Promise<void> {
    if (this.model.db.readyState !== 1) throw new ApiException(`db ${this.model.db.name} disconnected`, HttpStatus.INTERNAL_SERVER_ERROR, 'Database');
  }

  async create<T = SaveOptions>(document: object, saveOptions?: T): Promise<CreatedModel> {
    const createdEntity = new this.model(document);
    const savedResult = await createdEntity.save(saveOptions as SaveOptions);

    return { id: savedResult.id, created: !!savedResult.id };
  }

  async find<TFilter = FilterQuery<T>, TQuery = QueryOptions>(filter: TFilter, options?: TQuery): Promise<T[]> {
    return await this.model.find(filter as FilterQuery<T>, undefined, options as QueryOptions);
  }

  async findById(id: string | number): Promise<T | null> {
    return await this.model.findById(id);
  }

  async findOne<TFilter = FilterQuery<T>, TQuery = QueryOptions>(filter: TFilter, options?: TQuery): Promise<T | null> {
    return await this.model.findOne(filter as FilterQuery<T>, undefined, options as QueryOptions);
  }

  async findAll(): Promise<T[]> {
    return await this.model.find();
  }

  async remove<TQuery = FilterQuery<T>>(filter: TQuery): Promise<RemovedModel> {
    const { deletedCount } = await this.model.remove(filter);
    return { deletedCount, deleted: !!deletedCount };
  }

  async updateOne<TQuery = FilterQuery<T>, TUpdate = UpdateQuery<T> | UpdateWithAggregationPipeline, TOptions = QueryOptions<T>>(
    filter: TQuery,
    updated: TUpdate,
    options?: TOptions,
  ): Promise<UpdatedModel> {
    return await this.model.updateOne(
      filter as FilterQuery<T>,
      updated as UpdateQuery<T> | UpdateWithAggregationPipeline,
      options as QueryOptions<T>,
    );
  }

  async updateMany<TQuery = FilterQuery<T>, TUpdate = UpdateQuery<T> | UpdateWithAggregationPipeline, TOptions = QueryOptions<T>>(
    filter: TQuery,
    updated: TUpdate,
    options?: TOptions,
  ): Promise<UpdatedModel> {
    return await this.model.updateMany(
      filter as FilterQuery<T>,
      updated as UpdateQuery<T> | UpdateWithAggregationPipeline,
      options as QueryOptions<T>,
    );
  }
}
