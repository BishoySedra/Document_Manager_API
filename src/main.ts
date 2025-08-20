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
        undefined  // allow undefined for Swagger UI when loaded from same origin
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
    .setDescription(`
      A comprehensive Document Management System API built with NestJS and Prisma ORM.
      
      ## Features
      - **User Authentication**: JWT-based authentication with refresh tokens
      - **Role-Based Access Control**: Admin and User roles with different permissions
      - **Document Management**: Upload, download, and manage documents with metadata
      - **Folder Organization**: Create hierarchical folder structures
      - **Permission System**: Fine-grained document permissions (View, Edit, Download)
      - **File Storage**: Cloudinary integration for secure file storage
      - **API Standards**: JSend specification compliant responses
      
      ## Authentication
      Most endpoints require authentication. Use the login endpoint to obtain a JWT token,
      then use the "Authorize" button to add your Bearer token for testing protected routes.
      
      ## Response Format
      All responses follow the JSend specification with status, message, and optional body fields.
    `)
    .setVersion('1.0.0')
    .setContact(
      'API Support',
      'https://github.com/BishoySedra/Document_Manager_API',
      'support@example.com'
    )
    .setLicense(
      'MIT License',
      'https://opensource.org/licenses/MIT'
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // This name here is important for matching up with @ApiBearerAuth() in controllers
    )
    .addSecurityRequirements('JWT-auth')
    .addServer(`${protocol}://${app_url}`, 'Development server')
    .addTag('Authentication', 'User registration, login, and token management')
    .addTag('Users', 'User profile management and administration')
    .addTag('Documents', 'Document upload, retrieval, and metadata management')
    .addTag('Folders', 'Folder creation and hierarchical organization')
    .addTag('Permissions', 'Document access control and permissions')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);


  // starting the app
  await app.listen(port);

  // console.log(`Swagger is running on: http://localhost:${port}/docs`);
  // console.log(`API is running on: http://localhost:${port}${prefix}`);

  // production mode
  console.log(`Swagger is running on: ${protocol}://${app_url}/docs`);
  console.log(`API is running on: ${protocol}://${app_url}${prefix}`);
}

// starting the app
bootstrap();
