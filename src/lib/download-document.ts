/**
 * The download route returns JSON `{ url }` (a short-lived signed URL).
 * Callers must open that URL; fetching the route and parsing a redirect body fails.
 */
export async function requestDocumentDownload(
  docId: string,
  fetchImpl: typeof fetch = fetch,
): Promise<string> {
  const res = await fetchImpl(`/api/documents/${encodeURIComponent(docId)}/download`)
  if (!res.ok) {
    throw new Error('Could not generate download link')
  }

  const data = (await res.json()) as { url?: unknown }
  if (typeof data?.url !== 'string' || data.url.length === 0) {
    throw new Error('Could not generate download link')
  }

  return data.url
}
