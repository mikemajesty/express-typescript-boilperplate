import { MongooseOptions } from 'mongoose';

export abstract class IDataBaseService {
  abstract getDefaultConnection<T = MongooseOptions>(options?: T): T;
}
