import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>(); // ✅ ép kiểu rõ ràng ở đây

    const statusCode = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let message = 'Unexpected error';
    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      'message' in exceptionResponse
    ) {
      const msg = (exceptionResponse as { message: string | string[] }).message;
      message = Array.isArray(msg) ? msg.join(', ') : msg;
    }

    const errorResponse: ErrorResponse = {
      error: exception.name,
      message,
      statusCode,
    };

    response.status(statusCode).json(errorResponse);
  }
}
