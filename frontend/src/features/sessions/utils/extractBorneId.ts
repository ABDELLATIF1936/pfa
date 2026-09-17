const BORNE_ID_PATTERN = /^B_[A-Za-z0-9-]+_[A-Za-z0-9-]+$/

function normalizeCandidate(value: string | null | undefined): string | null {
  const candidate = value?.trim()
  return candidate && BORNE_ID_PATTERN.test(candidate) ? candidate : null
}

export function extractBorneIdFromQr(scannedText: string): string | null {
  const rawText = scannedText.trim()
  const directId = normalizeCandidate(rawText)
  if (directId) return directId

  try {
    const url = new URL(rawText)
    const queryId = normalizeCandidate(url.searchParams.get('borne'))
      ?? normalizeCandidate(url.searchParams.get('borneId'))
      ?? normalizeCandidate(url.searchParams.get('identifiantBorne'))
    if (queryId) return queryId

    const pathParts = url.pathname.split('/').filter(Boolean).reverse()
    return pathParts.map(normalizeCandidate).find(Boolean) ?? null
  } catch {
    return null
  }
}