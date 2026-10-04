import { Env } from '@adonisjs/core/env'

const env = await Env.create(new URL('../', import.meta.url), {
  NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
  PORT: Env.schema.number(),
  HOST: Env.schema.string({ format: 'host' }),
  LOG_LEVEL: Env.schema.enum([
    'fatal',
    'error',
    'warn',
    'info',
    'debug',
    'trace',
    'silent',
  ] as const),
  APP_KEY: Env.schema.secret(),
  APP_URL: Env.schema.string(),
  SEO_INDEXABLE: Env.schema.boolean.optional(),
  LIMITER_STORE: Env.schema.enum(['database', 'memory'] as const),
  SESSION_DRIVER: Env.schema.enum(['cookie'] as const),
  DB_HOST: Env.schema.string({ format: 'host' }),
  DB_PORT: Env.schema.number(),
  DB_USER: Env.schema.string(),
  DB_PASSWORD: Env.schema.secret(),
  DB_DATABASE: Env.schema.string(),
  DB_SSL: Env.schema.boolean.optional(),
  STORE_NAME: Env.schema.string(),
  STORE_DEFAULT_LOCALE: Env.schema.enum(['en', 'vi'] as const),
  STORE_CURRENCY: Env.schema.string(),
  STORE_TIMEZONE: Env.schema.string(),
  SMTP_HOST: Env.schema.string.optional(),
  SMTP_PORT: Env.schema.number.optional(),
  SMTP_USERNAME: Env.schema.string.optional(),
  SMTP_PASSWORD: Env.schema.secret.optional(),
  MAIL_FROM_ADDRESS: Env.schema.string.optional(),
  MAIL_FROM_NAME: Env.schema.string.optional(),
  DRIVE_DISK: Env.schema.enum.optional(['fs', 's3'] as const),
  S3_ENDPOINT: Env.schema.string.optional(),
  S3_REGION: Env.schema.string.optional(),
  S3_BUCKET: Env.schema.string.optional(),
  S3_ACCESS_KEY_ID: Env.schema.string.optional(),
  S3_SECRET_ACCESS_KEY: Env.schema.secret.optional(),
  S3_PUBLIC_URL: Env.schema.string.optional(),
})

const appUrl = new URL(env.get('APP_URL'))
if (
  !['http:', 'https:'].includes(appUrl.protocol) ||
  appUrl.username ||
  appUrl.password ||
  appUrl.search ||
  appUrl.hash ||
  appUrl.pathname !== '/'
) {
  throw new Error(
    'APP_URL must be an HTTP or HTTPS origin without credentials, path, query or fragment'
  )
}
const driveDisk = env.get('DRIVE_DISK') ?? 'fs'
if (driveDisk === 's3') {
  const endpoint = env.get('S3_ENDPOINT')
  const publicUrl = env.get('S3_PUBLIC_URL')
  if (
    !env.get('S3_ACCESS_KEY_ID') ||
    !env.get('S3_SECRET_ACCESS_KEY') ||
    !env.get('S3_REGION') ||
    !env.get('S3_BUCKET') ||
    !publicUrl
  ) {
    throw new Error(
      'S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_REGION, S3_BUCKET, and S3_PUBLIC_URL are required when DRIVE_DISK is s3'
    )
  }
  assertHttpUrl(publicUrl, 'S3_PUBLIC_URL')
  if (endpoint) assertHttpUrl(endpoint, 'S3_ENDPOINT')
}

function assertHttpUrl(value: string, name: string) {
  let url: URL
  try {
    url = new URL(value)
  } catch {
    throw new Error(name + ' must be an HTTP or HTTPS URL')
  }
  if (
    !['http:', 'https:'].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  ) {
    throw new Error(name + ' must be an HTTP or HTTPS URL without credentials, query, or fragment')
  }
}

export default env
