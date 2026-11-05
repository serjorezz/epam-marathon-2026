# ---- Build stage: compile TypeScript ----
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ---- Runtime stage: slim production image ----
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Install production dependencies only
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund && npm cache clean --force

# Compiled output and the JSON documents served at runtime
COPY --from=build /app/dist ./dist
COPY manifest.json gemini-extension.json ./

# Non-root user for security
RUN addgroup -S mcp && adduser -S mcp -G mcp
USER mcp

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/health || exit 1

# HTTP / OpenAPI / SSE bridge mode (default).
# For stdio MCP mode override the command: docker run ... node dist/index.js --stdio
CMD ["node", "dist/index.js"]
