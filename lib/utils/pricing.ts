export const PLATFORM_FEE_PERCENT = Number(process.env.PLATFORM_FEE_PERCENT ?? 15)

export function calcFees(subtotal: number) {
  const serviceFee = Math.round(subtotal * (PLATFORM_FEE_PERCENT / 100))
  return { subtotal, serviceFee, total: subtotal + serviceFee }
}

export function formatPrice(amount: number, currency = 'EUR') {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function durationLabel(hours: number) {
  if (hours < 24) return `${hours}h`
  const days = Math.round(hours / 24)
  return days === 1 ? '1 day' : `${days} days`
}
