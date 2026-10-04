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
 * Deletes generated upload keys that no product image still references.
 * A missing file or a storage error is logged and left in place.
 * Brand files on this disk must be added to the reference check with their columns.
 */
export async function releaseUnusedUploads(keys: string[]) {
  const managed = [...new Set(keys.filter(isManagedUpload))]
  if (!managed.length) return
  let referenced: Set<string>
  try {
    const rows = await db
      .from('product_images')
      .whereIn('storage_key', managed)
      .select('storage_key')
    referenced = new Set(rows.map((row) => String(row.storage_key)))
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
