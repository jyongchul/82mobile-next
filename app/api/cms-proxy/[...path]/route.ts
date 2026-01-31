import { NextRequest, NextResponse } from 'next/server';
import * as http from 'http';

const GABIA_IP = '182.162.142.102';
const GABIA_PORT = 80;
const WP_HOST = '82mobile.com';

async function proxyToWordPress(request: NextRequest) {
  const url = new URL(request.url);
  const wpPath = url.pathname.replace(/^\/api\/cms-proxy/, '') || '/';
  const fullPath = `${wpPath}${url.search}`;

  const reqHeaders: Record<string, string> = {
    Host: WP_HOST,
    'X-Forwarded-For': request.headers.get('x-forwarded-for') || '',
    'X-Forwarded-Proto': 'https',
  };

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
          const rewritten = v
            .replace(/https?:\/\/82mobile\.com\/wp-admin/g, '/wp-admin')
            .replace(/https?:\/\/82mobile\.com\/wp-login/g, '/wp-login')
            .replace(/https?:\/\/82mobile\.com\/wp-content/g, '/wp-content')
            .replace(/https?:\/\/82mobile\.com\/wp-includes/g, '/wp-includes');
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
