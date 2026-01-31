import { NextRequest, NextResponse } from 'next/server';
import * as http from 'http';

const GABIA_IP = '182.162.142.102';
const GABIA_PORT = 80;
const WP_HOST = '82mobile.com';

async function proxyToWordPress(request: NextRequest) {
  const url = new URL(request.url);
  // Next.js rewrite preserves original URL in request.url
  // So we use the original pathname directly (not the rewritten /api/cms-proxy/... path)
  let wpPath = url.pathname;
  // Add trailing slash for wp-admin directory
  if (wpPath === '/wp-admin') wpPath = '/wp-admin/';
  const fullPath = `${wpPath}${url.search}` || '/';

  const reqHeaders: Record<string, string> = {
    Host: WP_HOST,
    'User-Agent': request.headers.get('user-agent') || 'Mozilla/5.0',
    Accept: request.headers.get('accept') || 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': request.headers.get('accept-language') || 'ko-KR,ko;q=0.9,en;q=0.8',
  };

  const xff = request.headers.get('x-forwarded-for');
  if (xff) reqHeaders['X-Forwarded-For'] = xff;

  const cookie = request.headers.get('cookie');
  if (cookie) reqHeaders['Cookie'] = cookie;

  const contentType = request.headers.get('content-type');
  if (contentType) reqHeaders['Content-Type'] = contentType;

  const referer = request.headers.get('referer');
  if (referer) {
    reqHeaders['Referer'] = referer.replace(/\/api\/cms-proxy/g, '');
  }

  let bodyBuf: ArrayBuffer | undefined;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    bodyBuf = await request.arrayBuffer();
    reqHeaders['Content-Length'] = String(bodyBuf.byteLength);
  }

  try {
    const result = await new Promise<{
      status: number;
      headers: http.IncomingHttpHeaders;
      body: Buffer;
    }>((resolve, reject) => {
      const req = http.request(
        {
          hostname: GABIA_IP,
          port: GABIA_PORT,
          path: fullPath,
          method: request.method,
          headers: reqHeaders,
        },
        (res) => {
          const chunks: Buffer[] = [];
          res.on('data', (chunk: Buffer) => chunks.push(chunk));
          res.on('end', () => {
            resolve({
              status: res.statusCode || 500,
              headers: res.headers,
              body: Buffer.concat(chunks),
            });
          });
        }
      );
      req.on('error', reject);
      req.setTimeout(30000, () => {
        req.destroy(new Error('Timeout'));
      });
      if (bodyBuf) req.write(Buffer.from(bodyBuf));
      req.end();
    });

    const outHeaders = new Headers();
    for (const [key, value] of Object.entries(result.headers)) {
      if (!value) continue;
      const lower = key.toLowerCase();
      if (['transfer-encoding', 'connection', 'keep-alive'].includes(lower)) continue;

      const values = Array.isArray(value) ? value : [value];
      for (const v of values) {
        if (lower === 'location') {
          // Rewrite absolute WordPress URLs to relative paths
          const rewritten = v.replace(/https?:\/\/82mobile\.com/g, '');
          outHeaders.set(key, rewritten);
        } else if (lower === 'set-cookie') {
          outHeaders.append(key, v);
        } else {
          outHeaders.set(key, v);
        }
      }
    }

    const ct = result.headers['content-type'] || '';
    if (typeof ct === 'string' && ct.includes('text/html')) {
      const html = result.body.toString('utf-8');
      return new NextResponse(html, { status: result.status, headers: outHeaders });
    }

    return new NextResponse(result.body as unknown as BodyInit, {
      status: result.status,
      headers: outHeaders,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[cms-proxy] Error:', msg);
    return NextResponse.json({ error: 'WordPress proxy error', message: msg }, { status: 502 });
  }
}

export const GET = proxyToWordPress;
export const POST = proxyToWordPress;
export const PUT = proxyToWordPress;
export const DELETE = proxyToWordPress;
export const PATCH = proxyToWordPress;

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
