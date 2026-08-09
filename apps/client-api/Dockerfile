FROM node:20-alpine AS builder

WORKDIR /workspace

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx nx build client-api


FROM node:20-alpine AS runner

WORKDIR /app

COPY --from=builder /workspace/dist/apps/client-api/ .
RUN npm ci --omit=dev

EXPOSE 3000

CMD ["node", "main.js"]
