import { NextResponse } from 'next/server';
import * as http from 'http';

export async function GET() {
  try {
    const result = await new Promise<{ status: number; body: string }>((resolve, reject) => {
      const req = http.request(
        {
          hostname: '182.162.142.102',
          port: 80,
          path: '/wp-login.php',
          method: 'GET',
          headers: {
            Host: '82mobile.com',
            'User-Agent': 'Mozilla/5.0',
            Accept: 'text/html',
          },
        },
        (res) => {
          let body = '';
          res.on('data', (chunk: Buffer) => (body += chunk.toString()));
          res.on('end', () => resolve({ status: res.statusCode || 500, body }));
        }
      );
      req.on('error', reject);
      req.setTimeout(15000, () => req.destroy(new Error('Timeout')));
      req.end();
    });

    return NextResponse.json({
      gabia_status: result.status,
      has_login_form: result.body.includes('user_login'),
      body_preview: result.body.slice(0, 300),
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown';
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
