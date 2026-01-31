import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const IP = "182.162.142.102";
const HOST = "82mobile.com";
const BASE_URL = `http://${IP}`;

async function loginAndFix() {
  const headers = {
    'Host': HOST,
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Content-Type': 'application/x-www-form-urlencoded'
  };

  let cookies: string[] = [];

  // 1. Get Cookie
  let res = await fetch(`${BASE_URL}/wp-login.php`, { headers, redirect: 'manual' });
  const setCookie = res.headers.get('set-cookie');
  if (setCookie) cookies.push(setCookie);

  // 2. Post Login
  const body = new URLSearchParams({
    'log': 'whadmin',
    'pwd': 'WhMkt2026!@AdamKorSim',
    'wp-submit': 'Log In',
    'testcookie': '1'
  });

  res = await fetch(`${BASE_URL}/wp-login.php`, {
    method: 'POST',
    headers: { ...headers, 'Cookie': cookies.join('; ') },
    body: body,
    redirect: 'manual'
  });
  
  // Capture all cookies
  // Node fetch headers might be an object or iterable.
  // We need to robustly capture Set-Cookie.
  // In Next.js Edge/Node runtime, headers.get('set-cookie') might join them.
  // Let's assume comma separated or handle it.
  const loginCookies = res.headers.get('set-cookie'); 
  if (loginCookies) cookies.push(loginCookies);
  
  const cookieString = cookies.join('; ');

  // 3. Check Plugins Page to get Nonce/Link
  res = await fetch(`${BASE_URL}/wp-admin/plugins.php`, {
    headers: { ...headers, 'Cookie': cookieString }
  });
  const html = await res.text();
  
  const match = html.match(/href="([^"]+action=activate[^"]+woocommerce[^"]+)"/);
  let log = [`Login Status: ${res.status}`];
  
  if (match) {
    let activateUrl = match[1].replaceAll('&amp;', '&');
    log.push(`Found Activate URL: ${activateUrl}`);
    
    // If URL is relative "plugins.php?...", make it absolute
    // If it is absolute "http://82mobile.com/...", replace with IP
    
    let target = activateUrl;
    if (!target.startsWith('http')) {
        target = `${BASE_URL}/wp-admin/${target}`;
    }
    
    // Replace Domain with IP
    const targetUrl = target.replace(HOST, IP).replace("https://", "http://");
    
    res = await fetch(targetUrl, { 
      headers: { ...headers, 'Cookie': cookieString }
    });
    log.push(`Activation Result: ${res.status}`);
  } else {
    log.push("WooCommerce Activate Link NOT found. Already active or not present.");
  }

  // 4. Flush Permalinks
  res = await fetch(`${BASE_URL}/wp-admin/options-permalink.php`, {
    headers: { ...headers, 'Cookie': cookieString }
  });
  const permHtml = await res.text();
  const nonceMatch = permHtml.match(/name="_wpnonce" value="([^"]+)"/);
  const refererMatch = permHtml.match(/name="_wp_http_referer" value="([^"]+)"/);
  
  if (nonceMatch) {
    const nonce = nonceMatch[1];
    const referer = refererMatch ? refererMatch[1] : '';
    
    const permBody = new URLSearchParams({
      'option_page': 'permalink',
      'action': 'update',
      '_wpnonce': nonce,
      '_wp_http_referer': referer,
      'permalink_structure': '/%postname%/',
      'submit': 'Save Changes'
    });
    
    res = await fetch(`${BASE_URL}/wp-admin/options-permalink.php`, {
      method: 'POST',
      headers: { ...headers, 'Cookie': cookieString },
      body: permBody
    });
    log.push(`Permalink Flush Result: ${res.status}`);
  } else {
    log.push("Permalink Nonce not found.");
  }

  return log;
}

export async function GET() {
  try {
    const logs = await loginAndFix();
    return NextResponse.json({ success: true, logs });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.toString() }, { status: 500 });
  }
}
