import { defineConfig } from '@adonisjs/core/http'

/** Compile each configured address separately; proxy-addr does not parse comma-separated strings. */
export function trustedProxies(value?: string) {
  const addresses =
    value
      ?.split(',')
      .map((address) => address.trim())
      .filter(Boolean) ?? []
  if (!addresses.length) return false
  const checks = addresses.map((address) => defineConfig({ trustProxy: address }).trustProxy)
  return (address: string, distance: number) => checks.some((check) => check(address, distance))
}
