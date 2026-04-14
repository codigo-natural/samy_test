import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

export async function setupApp(app: INestApplication): Promise<void> {
  const configService = app.get(ConfigService);

  const apiPrefix =
    configService.get<string>('configuration.app.apiPrefix') ?? 'api';

  app.setGlobalPrefix(apiPrefix);

  const corsOrigin = configService.get<string>('configuration.app.corsOrigin');
  if (corsOrigin) {
    app.enableCors({
      origin: corsOrigin,
      credentials: true,
    });
  }

  app.use(helmet());
  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger docs enabled for demo (production included)
  const config = new DocumentBuilder()
    .setTitle('Portal API')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document);
}
