import { IHttpAdapter } from '../adapter';
import { HttpService } from '../service';

describe('HttpService', () => {
  let httpService: IHttpAdapter;

  beforeEach(() => {
    httpService = HttpService();
  });

  describe('instance', () => {
    test('should instance successfully', () => {
      expect(httpService.http).toBeDefined();
    });
  });
});
