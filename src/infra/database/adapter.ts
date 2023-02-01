export interface IDataBaseService<TInstance = any, TModel = any> {
  client: TInstance;
  getConnectionString(config: TModel): string;
  connect(connection?: string): Promise<TInstance>;
}
