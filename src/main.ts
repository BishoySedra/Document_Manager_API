import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { GlobalHttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  // creating instance of the app
  const app = await NestFactory.create(AppModule);

  // setting up the port
  const port = process.env.PORT || 3000;

  // setting up global prefix for the API
  const prefix = process.env.PREFIX_URL || '/api/v1';
  app.setGlobalPrefix(prefix);

  // enabling CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
  });

  // enabling global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true
    }),
  );

  // setting up global interceptor for response to achieve Jsend Specification Format
  app.useGlobalInterceptors(new ResponseInterceptor());

  // setting up global filter for exception handling
  app.useGlobalFilters(new GlobalHttpExceptionFilter());

  // starting the app
  await app.listen(3000);

  console.log(`Application is running on: ${port}!`);
}

// starting the app
bootstrap();
