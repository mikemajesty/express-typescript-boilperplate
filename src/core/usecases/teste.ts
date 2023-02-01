import { IInfra } from '@/interfaces/infra';

export class Test {
  constructor(infra?: IInfra) {
    // eslint-disable-next-line no-console
    console.log('infra', infra);
  }
}
