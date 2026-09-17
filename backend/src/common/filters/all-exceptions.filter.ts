import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
  path: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse();
    const request = context.getRequest();

    this.logger.error(
      `${request.method} ${request.url}`,
      exception instanceof Error ? exception.stack : String(exception),
    );

    const body = this.toResponse(exception, request.url);
    response.status(body.statusCode).json(body);
  }

  private toResponse(exception: unknown, path: string): ErrorResponse {
    if (exception instanceof QueryFailedError && this.isUniqueViolation(exception)) {
      return this.errorResponse(
        HttpStatus.CONFLICT,
        'Cette ressource existe déjà',
        'ConflictException',
        path,
      );
    }

    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      const message = this.extractMessage(exceptionResponse);

      return this.errorResponse(
        statusCode,
        message,
        this.errorName(statusCode, exceptionResponse),
        path,
      );
    }

    return this.errorResponse(
      HttpStatus.INTERNAL_SERVER_ERROR,
      'Une erreur interne est survenue',
      'Internal Server Error',
      path,
    );
  }

  private isUniqueViolation(exception: QueryFailedError): boolean {
    const driverError = (exception as QueryFailedError & {
      driverError?: { code?: string };
    }).driverError;
    return driverError?.code === '23505';
  }

  private extractMessage(response: string | object): string | string[] {
    if (typeof response === 'string') return response;
    const message = (response as { message?: string | string[] }).message;
    return message ?? 'Une erreur est survenue';
  }

  private errorName(statusCode: number, response: string | object): string {
    if (typeof response !== 'string') {
      const error = (response as { error?: string }).error;
      if (error) return error;
    }
    return HttpStatus[statusCode] ?? 'Http Exception';
  }

  private errorResponse(
    statusCode: number,
    message: string | string[],
    error: string,
    path: string,
  ): ErrorResponse {
    return {
      statusCode,
      message,
      error,
      timestamp: new Date().toISOString(),
      path,
    };
  }
}