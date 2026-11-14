[README.md](https://github.com/user-attachments/files/34863314/README.md)
# LOBUS Outlet — E-commerce

Loja virtual de moda masculina (streetwear e grifes) desenvolvida sob demanda para a LOBUS Outlet, em Goiânia/GO. O projeto inclui a vitrine para o cliente e um painel administrativo para gestão da loja.

## Funcionalidades

- Catálogo de produtos organizado por categorias
- Busca de produtos
- Sacola de compras
- Login e área do cliente
- Acompanhamento de pedidos
- Atendimento via WhatsApp
- Opções de retirada na loja e entrega por motoboy
- Pagamento via Pix
- Painel administrativo (`/admin`) para gestão da loja

## Tecnologias

- **Front-end e back-end:** Next.js, React, TypeScript
- **Banco de dados:** PostgreSQL
- **ORM:** Prisma
- **Infraestrutura:** Docker e Docker Compose
- **Qualidade:** ESLint e GitHub Actions

## Como rodar o projeto

1. Clone o repositório:
   ```bash
   git clone https://github.com/eltonshadow/ecomerce-lobus-outlet.git
   cd ecomerce-lobus-outlet
   ```
2. Copie o arquivo de variáveis de ambiente e preencha com seus dados:
   ```bash
   cp .env.example .env
   ```
3. Suba o banco de dados e a aplicação com Docker:
   ```bash
   docker compose up -d
   ```
   Ou, sem Docker:
   ```bash
   npm install
   npx prisma migrate dev
   npm run dev
   ```
4. Acesse `http://localhost:3000`

## Autor

**Elton Gomes Lima Filho**
Estudante de Tecnologia da Informação (Estácio)

[LinkedIn](https://www.linkedin.com/in/elton-gomes-432964440) · [GitHub](https://github.com/eltonshadow) · eltongomeslima@outlook.com
