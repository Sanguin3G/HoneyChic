import { createHmac, timingSafeEqual } from 'node:crypto'
import env from '#start/env'

/**
 * The one-time code that lets a browser create the first owner. It is derived from
 * APP_KEY, so only someone with server access can read it (log, `node ace owner:code`).
 */
export function firstRunCode() {
  const hex = createHmac('sha256', env.get('APP_KEY').release())
    .update('honeychic:first-owner')
    .digest('hex')
    .slice(0, 12)
    .toUpperCase()
  return hex.match(/.{4}/g)!.join('-')
}

export function matchesFirstRunCode(value: string) {
  const expected = Buffer.from(firstRunCode())
  const given = Buffer.from(value.trim().toUpperCase())
  return given.length === expected.length && timingSafeEqual(given, expected)
}
