import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe())

  const PORT = process.env.APP_PORT ?? 3001;
  await app.listen(PORT, ()=>{
    console.log(`Application is running on PORT: ${PORT} `);
  });

}
bootstrap();
