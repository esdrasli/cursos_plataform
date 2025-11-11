# Backend Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
COPY tsconfig.json ./

# Instalar dependências
RUN npm ci

# Copiar código fonte
COPY src ./src
COPY docker-entrypoint.sh ./

# Tornar script executável
RUN chmod +x docker-entrypoint.sh

# Expor porta
EXPOSE 3001

# Entrypoint
ENTRYPOINT ["./docker-entrypoint.sh"]

