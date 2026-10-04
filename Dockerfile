FROM node:24-bookworm-slim AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM dependencies AS build
COPY . .
# Process-scoped build placeholders; runtime configuration is injected separately.
RUN NODE_ENV=production HOST=0.0.0.0 PORT=3333 LOG_LEVEL=info \
    APP_KEY=build-only-not-a-runtime-secret APP_URL=http://localhost:3333 \
    SESSION_DRIVER=cookie LIMITER_STORE=database DB_HOST=127.0.0.1 DB_PORT=5432 DB_USER=honeychic \
    DB_PASSWORD=build-only DB_DATABASE=honeychic DB_SSL=false \
    STORE_NAME=DemoSupply STORE_DEFAULT_LOCALE=en STORE_CURRENCY=VND STORE_TIMEZONE=UTC \
    npm run build

FROM node:24-bookworm-slim AS production
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3333
WORKDIR /app
COPY --from=build --chown=node:node /app/build ./
RUN npm ci --omit=dev && npm cache clean --force
USER node
EXPOSE 3333
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s \
  CMD node -e "fetch('http://127.0.0.1:'+process.env.PORT+'/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"
CMD ["node", "bin/server.js"]