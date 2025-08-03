# Zheus API - Clean Architecture .NET Generator

Uma API Node.js moderna que gera projetos .NET completos com Clean Architecture, incluindo entidades, comandos, handlers, repositórios e controllers.

## 🚀 Características

- **Geração Automática de Projetos .NET**: Clean Architecture completa
- **Download ZIP**: Projetos prontos para desenvolvimento
- **TypeScript + Express.js**: API robusta e type-safe
- **Templates Handlebars**: Sistema flexível de geração de código
- **Railway Deploy**: Hospedagem em produção
- **Cache Global**: Sistema otimizado de templates
- **Multi-entidade**: Suporte a múltiplas entidades por projeto

## 🏗️ Arquitetura Gerada

Os projetos .NET seguem Clean Architecture com:

```
ProjectName/
├── API/                    # Controllers, Middleware, Configurations
├── Application/            # DTOs, Services, Interfaces
├── Domain/                 # Entities, Commands, Handlers, Repositories
├── Infrastructure/         # Data Access, DbContext, Repositories
└── IoC/                   # Dependency Injection
```

## 📦 Estrutura da API

```
src/
├── controllers/            # Request handlers
├── services/              # Business logic (geração de código)
├── templates/             # Templates Handlebars (.NET)
├── utils/                 # TemplateManager e helpers
├── types/                 # TypeScript types
└── routes/                # API routes
```

## 🛠️ Instalação

1. Clone o repositório:
```bash
git clone https://github.com/arturn1/Zheus.git
cd Zheus
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
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

## 🌐 API Endpoints

### 📋 Health Check
- `GET /api/health` - Health check básico
- `GET /api/health/detailed` - Health check detalhado

### 🔧 .NET Management
- `GET /api/dotnet/status` - Verifica se .NET está instalado
- `POST /api/dotnet/install` - Instala .NET LTS (se não estiver instalado)
- `POST /api/dotnet/reinstall` - Força reinstalação do .NET
- `GET /api/dotnet/info` - Informações detalhadas da instalação
- `GET /api/dotnet/compatibility` - Verifica compatibilidade do sistema

### 🏗️ Geração de Projetos

#### **POST** `/api/project/scaffold-download`

Gera um projeto .NET completo com Clean Architecture e retorna como arquivo ZIP para download.

##### **📄 Payload de Exemplo:**

```json
{
  "projectOptions": {
    "name": "TaskManagerAPI",
    "template": "webapi",
    "framework": "net8.0"
  },
  "entities": [
    {
      "name": "Task",
      "properties": [
        { "name": "Title", "type": "string", "isRequired": true },
        { "name": "Description", "type": "string", "isRequired": false },
        { "name": "DueDate", "type": "DateTime?", "isRequired": false },
        { "name": "IsCompleted", "type": "bool", "isRequired": true },
        { "name": "Priority", "type": "int", "isRequired": true },
        { "name": "UserId", "type": "Guid", "isRequired": true }
      ]
    },
    {
      "name": "User",
      "properties": [
        { "name": "Name", "type": "string", "isRequired": true },
        { "name": "Email", "type": "string", "isRequired": true },
        { "name": "IsActive", "type": "bool", "isRequired": true }
      ]
    },
    {
      "name": "Category",
      "properties": [
        { "name": "Name", "type": "string", "isRequired": true },
        { "name": "Color", "type": "string", "isRequired": false }
      ]
    }
  ]
}
```

##### **🚀 Exemplo de Uso:**

```bash
# Usando cURL
curl -X POST "https://zheus-production.up.railway.app/api/project/scaffold-download" \
  -H "Content-Type: application/json" \
  -d @task-manager-example.json \
  --output TaskManagerAPI.zip

# Usando HTTPie
http POST https://zheus-production.up.railway.app/api/project/scaffold-download \
  projectOptions:='{"name":"MyProject","template":"webapi","framework":"net8.0"}' \
  entities:='[{"name":"Product","properties":[{"name":"Name","type":"string","isRequired":true}]}]' \
  --download --output=MyProject.zip
```

##### **📁 Estrutura do Projeto Gerado:**

```
ProjectName/
├── API/
│   ├── Controllers/           # Controllers para cada entidade + BaseController
│   ├── Middleware/           # CancellationToken + ErrorHandling
│   ├── Configurations/       # Swagger, DI, Environment
│   └── Program.cs           # Entry point configurado
├── Application/
│   ├── DTOs/Response/       # ApiResponseModel, HttpClientResponse
│   ├── Services/            # HttpClientService
│   ├── Interfaces/          # IHttpClientService
│   └── Dictionary/          # DefaultDictionary
├── Domain/
│   ├── Entities/            # Entidades + BaseEntity
│   ├── Commands/            # Create/Update commands por entidade
│   ├── Handlers/            # Handlers por entidade + contratos
│   ├── Repositories/        # Interfaces de repositório
│   └── Validation/          # Validatable, ValidatableTypes
├── Infrastructure/
│   ├── Data/                # ApplicationDbContext
│   ├── Repositories/        # Implementações dos repositórios
│   └── Configuration/       # DatabaseConfig
└── IoC/
    └── NativeInjectorBootStrapper.cs
```

##### **✨ Funcionalidades Incluídas:**

- **✅ Clean Architecture** completa
- **✅ Entity Framework Core** configurado
- **✅ Dependency Injection** (IoC)
- **✅ CRUD Controllers** para cada entidade
- **✅ Command/Handler Pattern** (CQRS)
- **✅ Repository Pattern** com interfaces
- **✅ Swagger Documentation** configurado
- **✅ Error Handling Middleware**
- **✅ Validation System**
- **✅ Response Models** padronizados

##### **📋 Tipos de Dados Suportados:**

- `string`, `int`, `long`, `decimal`, `double`, `float`
- `bool`, `DateTime`, `DateTime?`, `Guid`
- `List<T>`, arrays e tipos nullable

##### **🌐 URL de Produção:**
```
https://zheus-production.up.railway.app/api/project/scaffold-download
```

##### **📊 Resposta de Sucesso:**
- **Content-Type**: `application/zip`
- **Status**: `200 OK`
- **Body**: Arquivo ZIP contendo o projeto completo

##### **❌ Resposta de Erro:**
```json
{
  "success": false,
  "error": {
    "statusCode": 400,
    "message": "Nome do projeto é obrigatório"
  }
}
```

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

## 🔧 Configuração

### Variáveis de Ambiente

```env
PORT=3000
NODE_ENV=development
```

### Templates

O sistema usa templates Handlebars localizados em `src/templates/`:
- `api/` - Controllers, middlewares, configurações
- `domain/` - Entidades, comandos, handlers
- `application/` - DTOs, services, interfaces  
- `infrastructure/` - Repositórios, DbContext
- `ioc/` - Dependency injection

## 🚀 Deploy

### Railway (Produção)
```bash
# Push para o branch main triggera deploy automático
git push origin main
```

### Docker
```bash
# Build da imagem
docker build -t zheus-api .

# Executar container
docker run -p 3000:3000 zheus-api
```

## 📊 Monitoramento

- Health checks em `/api/health`
- Logs estruturados no console
- Template cache statistics via `TemplateManager.getCacheStats()`

## 🔍 Desenvolvimento

### Estrutura de Templates
```handlebars
{{#each entities}}
public class {{name}}Entity : BaseEntity
{
    {{#each properties}}
    public {{type}} {{name}} { get; set; }
    {{/each}}
}
{{/each}}
```

### TemplateManager
```typescript
// Cache global com lazy loading
const template = TemplateManager.getTemplate('domain/entities/entity.hbs');
const content = template({ entities, projectName });
```

## 📝 Exemplos Completos

### Arquivo de Exemplo (docs/task-manager-example.json)
```json
{
  "projectOptions": {
    "name": "TaskManagerAPI",
    "template": "webapi", 
    "framework": "net8.0"
  },
  "entities": [
    {
      "name": "Task",
      "properties": [
        { "name": "Title", "type": "string", "isRequired": true },
        { "name": "Description", "type": "string", "isRequired": false },
        { "name": "DueDate", "type": "DateTime?", "isRequired": false },
        { "name": "IsCompleted", "type": "bool", "isRequired": true },
        { "name": "Priority", "type": "int", "isRequired": true },
        { "name": "UserId", "type": "Guid", "isRequired": true }
      ]
    }
  ]
}
```

### Teste Local
```bash
# Download do projeto usando arquivo local
curl -X POST "http://localhost:3000/api/project/scaffold-download" \
  -H "Content-Type: application/json" \
  -d @docs/task-manager-example.json \
  --output MyProject.zip
```

## 🔒 Segurança

- Helmet.js para headers de segurança
- CORS configurado  
- Validation de entrada
- Error handling robusto
- Template path sanitization

## 📄 Licença

ISC

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

- **Produção**: https://zheus-production.up.railway.app
- **Repositório**: https://github.com/arturn1/Zheus
- **Issues**: https://github.com/arturn1/Zheus/issues

---

<div align="center">
  <b>Feito com ❤️ para acelerar o desenvolvimento .NET</b>
</div>
