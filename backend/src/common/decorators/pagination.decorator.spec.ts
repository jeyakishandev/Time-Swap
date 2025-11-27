import { ExecutionContext } from '@nestjs/common';
import { Pagination, PaginationParams } from './pagination.decorator';

describe('Pagination Decorator', () => {
  const createMockExecutionContext = (query: any): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ query }),
      }),
    } as ExecutionContext;
  };

  // Test direct de la logique du decorator
  // createParamDecorator retourne une fonction qui peut être appelée avec (data, ctx)
  const testPagination = (query: any): PaginationParams => {
    const ctx = createMockExecutionContext(query);
    // Le decorator créé par createParamDecorator peut être appelé directement
    const decoratorFn = Pagination as any;
    return decoratorFn(null, ctx);
  };

  it('should return default pagination when no query params', () => {
    const result = testPagination({});

    expect(result).toEqual({
      page: 1,
      limit: 10,
      skip: 0,
    });
  });

  it('should parse page and limit from query params', () => {
    const result = testPagination({
      page: '2',
      limit: '20',
    });

    expect(result).toEqual({
      page: 2,
      limit: 20,
      skip: 20,
    });
  });

  it('should enforce minimum page of 1', () => {
    const result = testPagination({
      page: '0',
      limit: '10',
    });

    expect(result.page).toBe(1);
    expect(result.skip).toBe(0);
  });

  it('should enforce minimum limit of 1', () => {
    const result = testPagination({
      page: '1',
      limit: '0',
    });

    expect(result.limit).toBe(1);
  });

  it('should enforce maximum limit of 100', () => {
    const result = testPagination({
      page: '1',
      limit: '200',
    });

    expect(result.limit).toBe(100);
  });

  it('should handle invalid page values', () => {
    const result = testPagination({
      page: 'invalid',
      limit: '10',
    });

    expect(result.page).toBe(1);
    expect(result.skip).toBe(0);
  });

  it('should handle invalid limit values', () => {
    const result = testPagination({
      page: '1',
      limit: 'invalid',
    });

    expect(result.limit).toBe(10);
  });

  it('should calculate skip correctly', () => {
    const result = testPagination({
      page: '5',
      limit: '15',
    });

    expect(result.skip).toBe(60);
  });
});
