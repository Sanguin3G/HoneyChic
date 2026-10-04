import { randomBytes, randomUUID } from 'node:crypto'

const secretPattern = /^[A-Za-z0-9_-]{43}$/
const idPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function secretLink() {
  return { id: randomUUID(), secret: randomBytes(32).toString('base64url') }
}

export function readSecretLink(params: { id?: unknown; secret?: unknown }) {
  if (typeof params.id !== 'string' || typeof params.secret !== 'string') return null
  if (!idPattern.test(params.id) || !secretPattern.test(params.secret)) return null
  return { id: params.id, secret: params.secret }
}
