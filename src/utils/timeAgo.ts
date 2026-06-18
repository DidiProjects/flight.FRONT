/** Tempo relativo curto em pt-BR: "agora", "há 5min", "há 2h", "há 3d". */
export function timeAgo(iso: string | null): string | null {
  if (!iso) return null
  const then = new Date(iso).getTime()
  if (isNaN(then)) return null

  const diffMin = Math.max(0, Math.floor((Date.now() - then) / 60000))
  if (diffMin < 1) return 'agora'
  if (diffMin < 60) return `há ${diffMin}min`

  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `há ${diffH}h`

  const diffD = Math.floor(diffH / 24)
  return `há ${diffD}d`
}
