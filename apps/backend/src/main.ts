import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupApp } from './bootstrap';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  await setupApp(app);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('configuration.app.port') ?? 3001;
  await app.listen(port);
}
bootstrap();
