FROM node:22-alpine
# openssl vem da mesma release do Alpine da imagem base; fixar a versão quebra a cada atualização dela.
# hadolint ignore=DL3018
RUN apk add --no-cache openssl
WORKDIR /app
RUN chown node:node /app
USER node
COPY --chown=node:node package.json package-lock.json ./
RUN npm ci
COPY --chown=node:node . .
RUN npx prisma generate && npm run build
EXPOSE 3000
CMD ["sh", "-c", "npx prisma db push --skip-generate && npx prisma db seed && npm start"]
