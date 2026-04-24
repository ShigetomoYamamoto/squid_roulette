const toBase64Url = (s: string): string => {
  const b64 = btoa(unescape(encodeURIComponent(s)))
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

const fromBase64Url = (s: string): string => {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4)
  return decodeURIComponent(escape(atob(b64)))
}

export const encodeItems = (items: string[]): string =>
  toBase64Url(JSON.stringify(items))

export const decodeItems = (param: string): string[] | null => {
  try {
    const parsed = JSON.parse(fromBase64Url(param)) as unknown
    if (!Array.isArray(parsed)) return null
    const clean = parsed.filter((x): x is string => typeof x === 'string').map((s) => s.slice(0, 20))
    if (clean.length < 2 || clean.length > 12) return null
    return clean
  } catch {
    return null
  }
}

export const buildShareUrl = (items: string[]): string => {
  const base = `${window.location.origin}${window.location.pathname}`
  return `${base}?items=${encodeItems(items)}`
}

export const readItemsFromLocation = (): string[] | null => {
  const params = new URLSearchParams(window.location.search)
  const raw = params.get('items')
  if (!raw) return null
  return decodeItems(raw)
}
