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

  // setting up Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Document Manager API')
    .setDescription('API for managing documents, folders, and users')
    .setVersion('1.0')
    .addBearerAuth()
    .addSecurityRequirements('bearer')
    .addServer(`http://localhost:${port}`)
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // starting the app
  await app.listen(port);

  console.log(`Application is running on: ${port}!`);
}

// starting the app
bootstrap();
