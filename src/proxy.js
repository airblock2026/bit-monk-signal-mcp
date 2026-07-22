#!/usr/bin/env node
/**
 * Bit Monk Signal — stdio ⇄ Streamable HTTP proxy.
 *
 * The eight Bit Monk Signal servers are remote (Streamable HTTP). This proxy lets
 * stdio-only MCP clients talk to them: it reads newline-delimited JSON-RPC from
 * stdin, POSTs it to the selected market's /mcp endpoint, and writes the reply
 * back to stdout. No transformation, no state — the remote server is the server.
 *
 * Market selection:
 *   BIT_MONK_MARKET=coin|us|kr|commodity|fx|inflation|seoul|dubai   (default: coin)
 *   BIT_MONK_URL=https://…/mcp                                     (overrides the above)
 */

const MARKETS = {
  coin: 'https://coin-signal.airblock2026.workers.dev/mcp',
  us: 'https://stock-signal-us.airblock2026.workers.dev/mcp',
  kr: 'https://stock-signal-kr.airblock2026.workers.dev/mcp',
  commodity: 'https://commodity-signal.airblock2026.workers.dev/mcp',
  fx: 'https://fx-signal.airblock2026.workers.dev/mcp',
  inflation: 'https://inflation-signal.airblock2026.workers.dev/mcp',
  seoul: 'https://seoul-apt-signal.airblock2026.workers.dev/mcp',
  dubai: 'https://dubai-property-signal.airblock2026.workers.dev/mcp',
};

const market = (process.env.BIT_MONK_MARKET || 'coin').trim().toLowerCase();
const endpoint = process.env.BIT_MONK_URL || MARKETS[market];

if (!endpoint) {
  process.stderr.write(
    `bit-monk-signal: unknown BIT_MONK_MARKET "${market}". Expected one of: ${Object.keys(MARKETS).join(', ')}\n`
  );
  process.exit(1);
}

const send = (msg) => process.stdout.write(JSON.stringify(msg) + '\n');

// -32603 Internal error — the remote hop failed, not the request itself.
const failure = (id, message) => ({
  jsonrpc: '2.0',
  id,
  error: { code: -32603, message: `bit-monk-signal proxy: ${message}` },
});

let pending = 0;
let stdinClosed = false;
const exitWhenDrained = () => {
  if (stdinClosed && pending === 0) process.exit(0);
};

async function forward(request) {
  const isNotification = request.id === undefined || request.id === null;
  let response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json, text/event-stream',
      },
      body: JSON.stringify(request),
    });
  } catch (err) {
    if (!isNotification) send(failure(request.id, `cannot reach ${endpoint} — ${err.message}`));
    return;
  }

  const body = await response.text();
  if (isNotification) return; // notifications get no reply, whatever the remote said

  if (!body.trim()) {
    send(failure(request.id, `empty response (HTTP ${response.status}) from ${endpoint}`));
    return;
  }

  try {
    send(JSON.parse(body));
  } catch {
    send(failure(request.id, `non-JSON response (HTTP ${response.status}): ${body.slice(0, 200)}`));
  }
}

let buffer = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  buffer += chunk;
  let newline;
  while ((newline = buffer.indexOf('\n')) !== -1) {
    const line = buffer.slice(0, newline).trim();
    buffer = buffer.slice(newline + 1);
    if (!line) continue;
    let request;
    try {
      request = JSON.parse(line);
    } catch {
      send({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } });
      continue;
    }
    pending += 1;
    forward(request).finally(() => {
      pending -= 1;
      exitWhenDrained();
    });
  }
});
// Don't drop in-flight requests when the client closes stdin.
process.stdin.on('end', () => {
  stdinClosed = true;
  exitWhenDrained();
});
