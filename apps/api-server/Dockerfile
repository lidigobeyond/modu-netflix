FROM node:20-alpine AS builder

WORKDIR /workspace

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx nx build api-server


FROM node:20-alpine AS runner

WORKDIR /app

COPY --from=builder /workspace/dist/apps/api-server/ .
RUN npm ci --omit=dev

EXPOSE 3000

CMD ["node", "main.js"]
