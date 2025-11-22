import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { ValidationPipe } from '@nestjs/common';
async function main() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    //pipe global para validaciones con dtos
    new ValidationPipe({
      //si lo dejamos borra la data no esperada
      whitelist: true,
      //hace un errror si se le pasa data no esperada
      forbidNonWhitelisted: true,
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
main();
