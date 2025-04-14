import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppResponse } from '../utils/response.util';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const ctx = context.switchToHttp();
        const res = ctx.getResponse();

        return next.handle().pipe(
            map((data) => {
                // If the response is already in { status, message, body } format, return it as is
                if (AppResponse.isFormatted(data)) {
                    return data;
                }

                // Otherwise, wrap it with default formatting
                const status = res.statusCode;
                const message = res.statusMessage || 'OK';
                return AppResponse.format(status, message, data);
            }),
        );
    }
}
