import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { GlobalHttpExceptionFilter } from './common/filters/http-exception.filter';
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger"


async function bootstrap() {
  // creating instance of the app
  const app = await NestFactory.create(AppModule);

  // setting up the port
  const port = process.env.PORT || 3000;

  // setting up global prefix for the API
  const prefix = process.env.PREFIX_URL || '/api/v1';
  app.setGlobalPrefix(prefix);

  const protocol = process.env.APP_PROTOCOL || 'http';
  const app_url = process.env.APP_URL || 'localhost';

  // enabling CORS
  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        `${protocol}://${app_url}`,
        `http://localhost:${port}`,
      ];

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
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

  // setting up Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Document Manager API')
    .setDescription('API for managing documents, folders, and users')
    .setVersion('1.0')
    .addBearerAuth()
    .addSecurityRequirements('bearer')
    .addServer(`${protocol}://${app_url}`)
    .addServer(`http://localhost:${port}`)
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);


  // starting the app
  await app.listen(port);

  console.log(`Swagger is running on: http://localhost:${port}/docs`);
  console.log(`API is running on: http://localhost:${port}${prefix}`);

  // production mode
  console.log(`Swagger is running on: ${protocol}://${app_url}/docs`);
  console.log(`API is running on: ${protocol}://${app_url}${prefix}`);
}

// starting the app
bootstrap();
