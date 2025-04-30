import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { AppResponse } from '../utils/response.util';

@Catch()
export class GlobalHttpExceptionFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {

        // Get the context of the request
        const ctx = host.switchToHttp();

        // Get the response object from the context
        const response = ctx.getResponse<Response>();

        // Get the request object from the context
        const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

        // Set the response status code and message
        const message = exception instanceof HttpException ? exception.message : 'Internal server error';

        // If the exception is a HttpException, get the response body
        let body = exception instanceof HttpException && typeof exception.getResponse() === 'object' ? (exception.getResponse() as any).message : null;

        // If the response body is a string, set it as the message
        if (message === body) {
            body = null;
        }

        // If the response body is null, set it to an empty object
        response.status(status).json(
            AppResponse.format(status, message, body),
        );
    }
}
