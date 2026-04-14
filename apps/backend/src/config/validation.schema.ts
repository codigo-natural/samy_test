import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production')
    .required(),
  PORT: Joi.number().integer().positive().optional(),
  API_PREFIX: Joi.string().min(1).required(),
  DATABASE_URL: Joi.string().uri().required(),
  JWT_SECRET: Joi.string().min(10).required(),
  JWT_EXPIRES_IN: Joi.string().min(1).required(),
  COOKIE_DOMAIN: Joi.string().min(1).required(),
  COOKIE_SECURE: Joi.boolean().required(),
  JWT_COOKIE_NAME: Joi.string().min(1).optional(),
  REQRES_BASE_URL: Joi.string().uri().required(),
  REQRES_API_KEY: Joi.when('NODE_ENV', {
    is: 'production',
    then: Joi.string().min(1).required(),
    otherwise: Joi.string().min(1).optional(),
  }),
  REQRES_TIMEOUT_MS: Joi.number().integer().positive().required(),
  REQRES_ALLOW_FALLBACK: Joi.boolean().optional(), // nuevo por validar
  CORS_ORIGIN: Joi.string().uri().required(),
  LOG_LEVEL: Joi.string().min(1).required(),
});
