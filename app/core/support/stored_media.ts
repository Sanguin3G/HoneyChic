import { randomUUID } from 'node:crypto'
import drive from '@adonisjs/drive/services/main'
import logger from '@adonisjs/core/services/logger'
import db from '@adonisjs/lucid/services/db'
import env from '#start/env'

const extensions = new Set(['jpg', 'jpeg', 'png', 'webp', 'avif'])

/** Generated merchant uploads. Seeded catalog/ keys never match. */
const managedUpload =
  /^uploads\/[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(?:jpg|jpeg|png|webp|avif)$/i

export function isManagedUpload(key: string) {
  return managedUpload.test(key)
}

export function newUploadKey(extname: string) {
  const ext = extname.toLowerCase()
  if (!extensions.has(ext)) throw new Error('Unsupported image')
  return `uploads/${randomUUID()}.${ext}`
}

/** Public URL for a relative key. The database stores the key, not this URL. */
export function mediaUrl(key: string) {
  if (env.get('DRIVE_DISK') === 's3') {
    const base = env.get('S3_PUBLIC_URL')
    if (!base) throw new Error('S3_PUBLIC_URL is required when DRIVE_DISK is s3')
    return base.replace(/\/$/, '') + '/' + key
  }
  return '/media/' + key
}

/**
 * Deletes generated upload keys that no product image, logo, or favicon still references.
 * A missing file or a storage error is logged and left in place.
 */
export async function releaseUnusedUploads(keys: string[]) {
  const managed = [...new Set(keys.filter(isManagedUpload))]
  if (!managed.length) return
  let referenced: Set<string>
  try {
    const images = await db
      .from('product_images')
      .whereIn('storage_key', managed)
      .select('storage_key')
    const brand = await db.from('store_settings').select('logo_key', 'favicon_key')
    referenced = new Set(images.map((row) => String(row.storage_key)))
    for (const row of brand) {
      if (row.logo_key) referenced.add(String(row.logo_key))
      if (row.favicon_key) referenced.add(String(row.favicon_key))
    }
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.name : 'Error' },
      'unused upload cleanup failed'
    )
    return
  }
  const disk = drive.use()
  for (const key of managed) {
    if (referenced.has(key)) continue
    try {
      await disk.delete(key)
    } catch (error) {
      logger.error(
        { error: error instanceof Error ? error.name : 'Error' },
        'unused upload cleanup failed'
      )
    }
  }
}
