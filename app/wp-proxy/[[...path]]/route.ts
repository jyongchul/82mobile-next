import { NextRequest, NextResponse } from 'next/server';

const GABIA_ORIGIN = 'http://182.162.142.102';
const WP_HOST = '82mobile.com';

/**
 * Reverse proxy for WordPress admin.
 * Gabia virtual hosting requires Host: 82mobile.com,
 * but Vercel rewrites don't set it correctly, causing 403.
 * This route manually fetches from Gabia with the correct Host header.
 */
async function proxyToWordPress(request: NextRequest) {
  const url = new URL(request.url);
  // Remove /wp-proxy prefix to get the real WordPress path
  const wpPath = url.pathname.replace(/^\/wp-proxy/, '') || '/';
  const targetUrl = `${GABIA_ORIGIN}${wpPath}${url.search}`;

  const headers = new Headers();
  headers.set('Host', WP_HOST);
  headers.set('X-Forwarded-For', request.headers.get('x-forwarded-for') || request.ip || '');
  headers.set('X-Forwarded-Proto', 'https');
  headers.set('X-Real-IP', request.headers.get('x-real-ip') || request.ip || '');

  // Forward cookies
  const cookie = request.headers.get('cookie');
  if (cookie) headers.set('Cookie', cookie);

  // Forward content type for POST requests
  const contentType = request.headers.get('content-type');
  if (contentType) headers.set('Content-Type', contentType);

  // Forward referer, rewriting admin.82mobile.com or 82mobile.com/wp-proxy to 82mobile.com
  const referer = request.headers.get('referer');
  if (referer) {
    headers.set('Referer', referer
      .replace(/\/wp-proxy/g, '')
      .replace(/admin\.82mobile\.com/g, '82mobile.com'));
  }

  try {
    const fetchOptions: RequestInit = {
      method: request.method,
      headers,
      redirect: 'manual', // Handle redirects ourselves
    };

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      fetchOptions.body = await request.arrayBuffer();
    }

    const resp = await fetch(targetUrl, fetchOptions);

    // Build response
    const respHeaders = new Headers();
    resp.headers.forEach((value, key) => {
      const lower = key.toLowerCase();
      // Skip hop-by-hop headers
      if (['transfer-encoding', 'connection', 'keep-alive', 'upgrade'].includes(lower)) return;

      // Rewrite Location headers to use our proxy path
      if (lower === 'location') {
        let location = value;
        // Rewrite absolute WordPress URLs to proxy URLs
        location = location
          .replace(/https?:\/\/82mobile\.com\/wp-admin/g, '/wp-proxy/wp-admin')
          .replace(/https?:\/\/82mobile\.com\/wp-login/g, '/wp-proxy/wp-login')
          .replace(/\/wp-admin/g, '/wp-proxy/wp-admin')
          .replace(/\/wp-login\.php/g, '/wp-proxy/wp-login.php');
        respHeaders.set(key, location);
        return;
      }

      // Rewrite Set-Cookie paths
      if (lower === 'set-cookie') {
        respHeaders.append(key, value);
        return;
      }

      respHeaders.set(key, value);
    });

    const body = resp.body;
    const contentTypeResp = resp.headers.get('content-type') || '';

    // For HTML responses, rewrite internal links
    if (contentTypeResp.includes('text/html')) {
      const text = await resp.text();
      const rewritten = text
        .replace(/https?:\/\/82mobile\.com\/wp-admin/g, '/wp-proxy/wp-admin')
        .replace(/https?:\/\/82mobile\.com\/wp-login/g, '/wp-proxy/wp-login')
        .replace(/https?:\/\/82mobile\.com\/wp-includes/g, '/wp-proxy/wp-includes')
        .replace(/https?:\/\/82mobile\.com\/wp-content/g, '/wp-proxy/wp-content');

      return new NextResponse(rewritten, {
        status: resp.status,
        headers: respHeaders,
      });
    }

    return new NextResponse(body, {
      status: resp.status,
      headers: respHeaders,
    });
  } catch (error: any) {
    console.error('[wp-proxy] Error:', error.message);
    return NextResponse.json(
      { error: 'WordPress proxy error', message: error.message },
      { status: 502 }
    );
  }
}

export const GET = proxyToWordPress;
export const POST = proxyToWordPress;
export const PUT = proxyToWordPress;
export const DELETE = proxyToWordPress;
export const PATCH = proxyToWordPress;

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
