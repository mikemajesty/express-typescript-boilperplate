export interface IDataBaseService<TInstance, TModel> {
  getConnectionString(config: TModel): string;
  connect(connection: string): Promise<TInstance>;
}
