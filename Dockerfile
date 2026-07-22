FROM node:22-alpine

WORKDIR /app

# No dependencies — the proxy is Node stdlib only (global fetch, process.stdin).
COPY package.json ./
COPY src ./src
COPY servers.json ./

# Which of the eight markets this container proxies. Override at run time:
#   docker run -e BIT_MONK_MARKET=us bit-monk-signal-mcp
ENV BIT_MONK_MARKET=coin

ENTRYPOINT ["node", "src/proxy.js"]
