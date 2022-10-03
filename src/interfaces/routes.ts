import { Router } from 'express-serve-static-core';

export interface IRoutes<T> {
  router: Router
  controller: T
}
