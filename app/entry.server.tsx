import { ServerRouter } from "react-router";
import { renderToString } from "react-dom/server";
import type { EntryContext } from "react-router";

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  reactRouterContext: EntryContext
) {
  const html = renderToString(
    <ServerRouter context={reactRouterContext} url={request.url} />
  );

  const allowedOrigins = [
    'http://localhost:3000',
    'https://app.jointhetrybe.com',
    'http://localhost:8100',
    'http://192.168.0.144:8100'
  ];
  const origin = request.headers.get('Origin');

  if (origin && allowedOrigins.includes(origin)) {
    responseHeaders.set('Access-Control-Allow-Origin', origin);
  } else {
    responseHeaders.set('Access-Control-Allow-Origin', 'http://localhost:3000');
  }
  responseHeaders.set('Content-Type', 'text/html');
  responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  responseHeaders.set('Access-Control-Allow-Credentials', 'true');

  return new Response(`<!DOCTYPE html>${html}`, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}
