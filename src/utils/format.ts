export function formatINR(value: number, decimals = 0): string {
  const isNegative = value < 0
  const abs = Math.abs(value)
  const formatted = abs.toLocaleString('en-IN', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  })
  return `${isNegative ? '-' : ''}\u20B9${formatted}`
}

export function formatPct(value: number, decimals = 2): string {
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(decimals)}%`
}

export function formatSignedINR(value: number, decimals = 0): string {
  const sign = value > 0 ? '+' : value < 0 ? '-' : ''
  return `${sign}${formatINR(Math.abs(value), decimals)}`
}

export function formatNumber(value: number): string {
  return value.toLocaleString('en-IN')
}

export function formatCompactVolume(value: number): string {
  if (value >= 10000000) return `${(value / 10000000).toFixed(2)}Cr`
  if (value >= 100000) return `${(value / 100000).toFixed(2)}L`
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
  return value.toString()
}
