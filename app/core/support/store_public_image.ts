import type { MultipartFile } from '@adonisjs/core/bodyparser'
import { newUploadKey } from '#core/support/stored_media'

/** Writes one validated image. The stored name is a new UUID, never the client filename. */
export async function storePublicImage(file: MultipartFile) {
  const key = newUploadKey(file.extname ?? '')
  await file.moveToDisk(key)
  return key
}
