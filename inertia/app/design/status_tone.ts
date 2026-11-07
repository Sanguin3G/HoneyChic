const tones = {
  pending: 'warning',
  processing: 'warning',
  shipped: 'success',
  completed: 'success',
  cancelled: 'danger',
  unpaid: 'warning',
  paid: 'success',
  refunded: 'muted',
  draft: 'muted',
  published: 'success',
  archived: 'muted',
} as const

export type StatusTone = 'success' | 'warning' | 'danger' | 'muted'

export function statusTone(status: string): StatusTone {
  if (status in tones) return tones[status as keyof typeof tones]
  return 'muted'
}
