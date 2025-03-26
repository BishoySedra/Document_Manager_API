import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // creating instance of the app
  const app = await NestFactory.create(AppModule);

  // setting up the port
  const port = process.env.PORT || 3000;

  // starting the app
  await app.listen(3000);
  console.log(`Application is running on: ${port}!`);
}
bootstrap();
