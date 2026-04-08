export async function onRequest(context) {
  const url = new URL(context.request.url);
  const target = url.pathname.replace('/proxy/', '') + url.search;

  if (!target.startsWith('http')) {
    return new Response('Invalid URL', { status: 400 });
  }

  const res = await fetch(target, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    redirect: 'follow',
  });

  const contentType = res.headers.get('content-type') || '';
  let body = await res.text();

  const base = new URL(target).origin;
  if (contentType.includes('html')) {
    body = body
      .replace(/(href|src|action)="\/(?!\/)/g, `$1="${base}/`)
      .replace(/(href|src|action)="\//g, `$1="/proxy/${base}/`);
  }

  const headers = new Headers();
  headers.set('Content-Type', contentType);
  headers.set('Access-Control-Allow-Origin', '*');

  return new Response(body, { status: res.status, headers });
}
