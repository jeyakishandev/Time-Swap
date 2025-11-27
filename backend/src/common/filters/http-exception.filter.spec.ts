import { HttpExceptionFilter } from './http-exception.filter';
import { HttpException, HttpStatus, BadRequestException, NotFoundException } from '@nestjs/common';
import { ArgumentsHost } from '@nestjs/common';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let mockResponse: any;
  let mockRequest: any;
  let mockArgumentsHost: ArgumentsHost;

  beforeEach(() => {
    filter = new HttpExceptionFilter();
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockRequest = {
      url: '/test',
      method: 'GET',
      ip: '127.0.0.1',
      headers: {},
      user: { userId: 'user123' },
    };

    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as any;
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  it('should handle HttpException with string response', () => {
    const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Test error',
        error: 'HttpException',
        path: '/test',
        method: 'GET',
      }),
    );
  });

  it('should handle HttpException with object response', () => {
    const exception = new BadRequestException({
      message: 'Validation failed',
      error: 'Bad Request',
      details: { field: 'email' },
    });

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Validation failed',
        error: 'Bad Request',
        details: { field: 'email' },
      }),
    );
  });

  it('should handle NotFoundException', () => {
    const exception = new NotFoundException('Resource not found');

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Resource not found',
      }),
    );
  });

  it('should handle generic Error', () => {
    const exception = new Error('Generic error');

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Generic error',
        error: 'Error',
      }),
    );
  });

  it('should handle unknown exception type', () => {
    const exception = { someProperty: 'value' };

    filter.catch(exception as any, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Une erreur interne est survenue',
      }),
    );
  });

  it('should extract userId from request.user.userId', () => {
    mockRequest.user = { userId: 'user123' };
    const exception = new HttpException('Test', HttpStatus.BAD_REQUEST);

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.json).toHaveBeenCalled();
  });

  it('should extract userId from request.user.sub', () => {
    mockRequest.user = { sub: 'user456' };
    const exception = new HttpException('Test', HttpStatus.BAD_REQUEST);

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.json).toHaveBeenCalled();
  });

  it('should use anonymous when no user', () => {
    mockRequest.user = undefined;
    const exception = new HttpException('Test', HttpStatus.BAD_REQUEST);

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.json).toHaveBeenCalled();
  });

  it('should use x-forwarded-for header for IP when available', () => {
    mockRequest.ip = undefined;
    mockRequest.headers['x-forwarded-for'] = '192.168.1.1';
    const exception = new HttpException('Test', HttpStatus.BAD_REQUEST);

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.json).toHaveBeenCalled();
  });
});

