import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import serverlessExpress from '@codegenie/serverless-express';
import { Handler } from 'aws-lambda';
import { setupApp } from './bootstrap';

let cachedHandler: Handler;

export const handler: Handler = async (event, context) => {
  if (!cachedHandler) {
    const app = await NestFactory.create(AppModule, { bufferLogs: true });
    await setupApp(app);
    await app.init();
    const expressApp = app.getHttpAdapter().getInstance();
    cachedHandler = serverlessExpress({ app: expressApp });
  }

  return cachedHandler(event, context, () => undefined);
};
