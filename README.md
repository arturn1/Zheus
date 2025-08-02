# Zheus API

Uma API Node.js moderna construída com TypeScript, Express.js e ferramentas de desenvolvimento modernas.

## 🚀 Características

- **TypeScript**: Type safety e melhor experiência de desenvolvimento
- **Express.js**: Framework web rápido e minimalista
- **Arquitetura MVC**: Organização clara com controllers, services e routes
- **Middleware personalizado**: Error handling e validação
- **ESLint & Prettier**: Code linting e formatação automática
- **Nodemon**: Hot reload durante desenvolvimento
- **Health checks**: Endpoints de monitoramento
- **CORS & Helmet**: Segurança configurada
- **Environment variables**: Configuração flexível

## 📦 Estrutura do Projeto

```
src/
├── controllers/     # Request handlers
├── services/        # Business logic
├── routes/          # API routes
├── middleware/      # Custom middleware
├── types/           # TypeScript types
├── utils/           # Helper functions
├── app.ts           # App configuration
└── server.ts        # Entry point
```

## 🛠️ Instalação

1. Clone o repositório:
```bash
git clone <repository-url>
cd zheus
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

## 🏃‍♂️ Como Executar

### Modo Desenvolvimento
```bash
npm run dev
```

### Build para Produção
```bash
npm run build
npm start
```

### Outros Comandos
```bash
# Linting
npm run lint
npm run lint:fix

# Formatação
npm run format

# Build com watch
npm run build:watch

# Limpar build
npm run clean
```

## 🌐 Endpoints

### Health Check
- `GET /api/health` - Health check básico
- `GET /api/health/detailed` - Health check detalhado

### .NET Management
- `GET /api/dotnet/status` - Verifica se .NET está instalado
- `POST /api/dotnet/install` - Instala .NET LTS (se não estiver instalado)
- `POST /api/dotnet/reinstall` - Força reinstalação do .NET
- `GET /api/dotnet/info` - Informações detalhadas da instalação
- `GET /api/dotnet/compatibility` - Verifica compatibilidade do sistema

## 🔧 Configuração

### Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|---------|
| `PORT` | Porta do servidor | `3000` |
| `NODE_ENV` | Ambiente de execução | `development` |
| `CORS_ORIGIN` | Origem permitida para CORS | `*` |

## 🧪 Desenvolvimento

### Adicionando Novas Rotas

1. Crie um controller em `src/controllers/`
2. Implemente a lógica de negócio em `src/services/`
3. Defina as rotas em `src/routes/`
4. Registre as rotas em `src/app.ts`

### Exemplo de Controller

```typescript
import { Request, Response } from 'express';
import { asyncHandler } from '../utils/responseUtils';
import { ResponseUtils } from '../utils/responseUtils';

export const getExample = asyncHandler(async (req: Request, res: Response) => {
  // Sua lógica aqui
  return ResponseUtils.success(res, data, 'Success message');
});
```

## 📝 Scripts Disponíveis

- `npm run dev` - Inicia o servidor em modo desenvolvimento
- `npm run build` - Compila TypeScript para JavaScript
- `npm start` - Inicia o servidor em produção
- `npm run lint` - Executa ESLint
- `npm run format` - Formata código com Prettier

## 🔒 Segurança

- Helmet.js para headers de segurança
- CORS configurado
- Rate limiting (pode ser adicionado)
- Input validation (pode ser adicionada)

## 📄 Licença

ISC

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request
