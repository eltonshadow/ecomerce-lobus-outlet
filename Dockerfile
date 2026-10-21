# Build: precisa do npm para instalar e compilar.
FROM node:22-alpine AS build
# openssl vem da mesma release do Alpine da imagem base; fixar a versão quebra a cada atualização dela.
# hadolint ignore=DL3018
RUN apk add --no-cache openssl
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npx prisma generate && npm run build

# Runtime: sem o npm embutido na imagem (as vulnerabilidades do Trivy eram dele), roda como usuário node.
FROM node:22-alpine
# hadolint ignore=DL3018
RUN apk add --no-cache openssl \
 && rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx
WORKDIR /app
COPY --from=build --chown=node:node /app /app
USER node
ENV PATH="/app/node_modules/.bin:$PATH"
EXPOSE 3000
CMD ["sh", "-c", "prisma db push --skip-generate && prisma db seed && next start"]
