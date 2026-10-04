import env from '#start/env'
import app from '@adonisjs/core/services/app'
import { defineConfig, services } from '@adonisjs/drive'

const filesystem = services.fs({
  location: app.makePath('public', 'media'),
  serveFiles: false,
  visibility: 'public',
})

const localDisk = defineConfig({
  default: 'fs',
  services: { fs: filesystem },
})

/**
 * The s3 driver is registered only when selected, so a local boot does not
 * import the AWS client. The client itself is constructed on first use.
 */
const driveConfig =
  env.get('DRIVE_DISK') === 's3'
    ? defineConfig({
        default: 's3',
        services: {
          fs: filesystem,
          s3: services.s3({
            credentials: {
              accessKeyId: env.get('S3_ACCESS_KEY_ID') ?? '',
              secretAccessKey: env.get('S3_SECRET_ACCESS_KEY')?.release() ?? '',
            },
            region: env.get('S3_REGION') ?? '',
            bucket: env.get('S3_BUCKET') ?? '',
            endpoint: env.get('S3_ENDPOINT') || undefined,
            cdnUrl: env.get('S3_PUBLIC_URL') || undefined,
            visibility: 'public',
            supportsACL: false,
          }),
        },
      })
    : localDisk

export default driveConfig

declare module '@adonisjs/drive/types' {
  export interface DriveDisks extends InferDriveDisks<typeof localDisk> {}
}
