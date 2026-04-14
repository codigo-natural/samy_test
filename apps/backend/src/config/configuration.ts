import { registerAs } from '@nestjs/config';

export type NodeEnv = 'development' | 'test' | 'production';

export interface AppConfig {
  nodeEnv: NodeEnv;
  port: number;
  apiPrefix: string;
  corsOrigin: string;
  logLevel: string;
}

export interface DatabaseConfig {
  databaseUrl: string;
}

export interface JwtConfig {
  secret: string;
  expiresIn: string;
}

export interface CookieConfig {
  domain: string;
  secure: boolean;
  jwtCookieName: string;
}

export interface ReqresConfig {
  baseUrl: string;
  timeoutMs: number;
  apiKey?: string;
}

export interface Configuration {
  app: AppConfig;
  database: DatabaseConfig;
  jwt: JwtConfig;
  cookie: CookieConfig;
  reqres: ReqresConfig;
}

export default registerAs(
  'configuration',
  (): Configuration => ({
    app: {
      nodeEnv: (process.env.NODE_ENV as NodeEnv) ?? 'development',
      port: Number(process.env.PORT),
      apiPrefix: process.env.API_PREFIX ?? 'api',
      corsOrigin: process.env.CORS_ORIGIN as string,
      logLevel: process.env.LOG_LEVEL ?? 'info',
    },
    database: {
      databaseUrl: process.env.DATABASE_URL as string,
    },
    jwt: {
      secret: process.env.JWT_SECRET as string,
      expiresIn: process.env.JWT_EXPIRES_IN as string,
    },
    cookie: {
      domain: process.env.COOKIE_DOMAIN as string,
      secure: String(process.env.COOKIE_SECURE).toLowerCase() === 'true',
      jwtCookieName: process.env.JWT_COOKIE_NAME ?? 'auth',
    },
    reqres: {
      baseUrl: process.env.REQRES_BASE_URL as string,
      timeoutMs: Number(process.env.REQRES_TIMEOUT_MS),
      apiKey: process.env.REQRES_API_KEY,
    },
  }),
);
