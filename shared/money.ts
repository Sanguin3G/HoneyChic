/** Shared exact money conversion/formatting. No floating-point price arithmetic. */
export function currencyDigits(currency: string) {
  if (!Intl.supportedValuesOf('currency').includes(currency))
    throw new Error('Unsupported currency')
  return new Intl.NumberFormat('en', { style: 'currency', currency }).resolvedOptions()
    .maximumFractionDigits!
}

export function parsePrice(decimal: string, currency: string): number {
  const digits = currencyDigits(currency)
  const match = /^(0|[1-9]\d{0,15})(?:\.(\d+))?$/.exec(decimal)
  if (!match || (match[2]?.length ?? 0) > digits) throw new Error('Invalid currency amount')
  const minor =
    BigInt(match[1]) * 10n ** BigInt(digits) + BigInt((match[2] ?? '').padEnd(digits, '0') || '0')
  if (minor > BigInt(Number.MAX_SAFE_INTEGER)) throw new Error('Amount exceeds safe range')
  return Number(minor)
}

export function decimalPrice(minor: number, currency: string): string {
  if (!Number.isSafeInteger(minor) || minor < 0) throw new Error('Invalid minor units')
  const digits = currencyDigits(currency)
  const divisor = 10n ** BigInt(digits)
  const amount = BigInt(minor)
  const whole = (amount / divisor).toString()
  return digits ? whole + '.' + (amount % divisor).toString().padStart(digits, '0') : whole
}

export function formatMoney(minor: number | bigint, currency: string, locale: 'en' | 'vi') {
  if ((typeof minor === 'number' && !Number.isSafeInteger(minor)) || minor < 0)
    throw new Error('Invalid minor units')
  const digits = currencyDigits(currency)
  const divisor = 10n ** BigInt(digits)
  const amount = BigInt(minor)
  const fraction = (amount % divisor).toString().padStart(digits, '0')
  return new Intl.NumberFormat(locale, { style: 'currency', currency })
    .formatToParts(amount / divisor)
    .map((part) => (part.type === 'fraction' ? fraction : part.value))
    .join('')
}
