# Multi-stage build para otimizar o container
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS base

# Instalar Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependências Node.js
RUN npm ci --only=production

# Copiar código fonte
COPY . .

# Compilar TypeScript (se necessário)
RUN npm run build || echo "No build script found"

# Expor porta
EXPOSE 3000

# Verificar instalações
RUN node --version && npm --version && dotnet --version

# Comando de inicialização
CMD ["npm", "start"]
