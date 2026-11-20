import fs from 'fs'
import path from 'path'
import { requestDocumentDownload } from '@/lib/download-document'

function jsonResponse(body: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: async () => body,
  } as Response
}

describe('document download contract', () => {
  const route = fs.readFileSync(
    path.join(process.cwd(), 'src/app/api/documents/[id]/download/route.ts'),
    'utf8',
  )

  it('returns a signed URL as JSON instead of redirecting the browser', () => {
    expect(route).toContain('NextResponse.json({ url: signedUrl.signedUrl })')
    expect(route).not.toContain('NextResponse.redirect')
  })

  it('returns the signed URL from a JSON body', async () => {
    const fetchImpl = jest.fn(async () => jsonResponse({ url: 'https://storage.example/file?token=abc' }))
    await expect(requestDocumentDownload('doc-1', fetchImpl)).resolves.toBe(
      'https://storage.example/file?token=abc',
    )
    expect(fetchImpl).toHaveBeenCalledWith('/api/documents/doc-1/download')
  })

  it('encodes the document id', async () => {
    const fetchImpl = jest.fn(async () => jsonResponse({ url: 'https://storage.example/file' }))
    await requestDocumentDownload('a/b c', fetchImpl)
    expect(fetchImpl).toHaveBeenCalledWith('/api/documents/a%2Fb%20c/download')
  })

  it('fails when the API does not return a URL', async () => {
    const fetchImpl = jest.fn(async () => jsonResponse({ error: 'nope' }, false, 500))
    await expect(requestDocumentDownload('doc-1', fetchImpl)).rejects.toThrow(/download link/)
  })

  it('fails when the body is not a signed URL', async () => {
    const fetchImpl = jest.fn(async () => jsonResponse({}))
    await expect(requestDocumentDownload('doc-1', fetchImpl)).rejects.toThrow(/download link/)
  })
})
