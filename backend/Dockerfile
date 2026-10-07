# Multi-stage keeps the final image small.
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund

FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY package.json app.js server.js ./
EXPOSE 3000
# Run as the built-in non-root user.
USER node
CMD ["node", "server.js"]
