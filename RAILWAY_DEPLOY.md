# 🚀 Deploy no Railway - Guia Completo

## 📋 Pré-requisitos
- [ ] Conta no [Railway](https://railway.app)
- [ ] Repositório GitHub conectado
- [ ] Código commitado e pushed

## 🛤️ Passos para Deploy

### 1. **Criar Projeto no Railway**
```bash
# Instalar Railway CLI (opcional)
npm install -g @railway/cli

# Login no Railway
railway login

# Deploy diretamente do GitHub (recomendado)
```

### 2. **Configurar no Dashboard Railway**
1. Acesse [railway.app](https://railway.app)
2. Click "New Project"
3. Choose "Deploy from GitHub repo"
4. Selecione o repositório `Zheus`

### 3. **Configurar Variáveis de Ambiente**
No Railway Dashboard → Settings → Environment:
```
NODE_ENV=production
PORT=3000
DOTNET_ENVIRONMENT=Production
DOTNET_CLI_TELEMETRY_OPTOUT=1
DOTNET_SKIP_FIRST_TIME_EXPERIENCE=1
TEMP_DIR=/tmp
CLEANUP_INTERVAL=300000
```

### 4. **Verificar Build Logs**
- Railway detecta automaticamente Node.js e .NET
- Build command: `npm run build`
- Start command: `npm start`

### 5. **Domínio Customizado (Opcional)**
Settings → Networking → Custom Domain

## 🔧 Configurações Automáticas

### **Build Process**
```
1. Railway detecta package.json
2. Instala Node.js 20
3. Instala .NET SDK 8
4. Executa npm ci
5. Executa npm run build
6. Inicia com npm start
```

### **Health Check**
- URL: `https://your-app.railway.app/api/health`
- Monitora Node.js e .NET automaticamente

### **Logs e Monitoramento**
```bash
# Ver logs em tempo real
railway logs

# Conectar ao container
railway shell
```

## 🚨 Troubleshooting

### **Problema: Build falha**
```bash
# Verificar logs no Railway Dashboard
# Ou via CLI:
railway logs --filter build
```

### **Problema: .NET não encontrado**
Verificar se `nixpacks.toml` está configurado corretamente

### **Problema: Timeout no health check**
Aumentar `healthcheckTimeout` no `railway.json`

### **Problema: Falta de memória**
```json
// railway.json
{
  "deploy": {
    "healthcheckTimeout": 600
  }
}
```

## 📊 Monitoramento

### **Métricas Disponíveis**
- CPU Usage
- Memory Usage
- Network I/O
- Request Rate
- Response Time

### **Alerts (Pro Plan)**
- Configurar alertas por email/Slack
- Monitoring de uptime
- Performance thresholds

## 💰 Pricing

### **Starter Plan (Grátis)**
- ✅ 500 horas/mês
- ✅ 1GB RAM
- ✅ 1GB Storage
- ✅ Custom domains

### **Developer Plan ($5/mês)**
- ✅ Unlimited usage
- ✅ 8GB RAM
- ✅ 100GB Storage
- ✅ Priority support

## 🔗 URLs Importantes

- **Dashboard**: https://railway.app/dashboard
- **Docs**: https://docs.railway.app
- **Status**: https://railway.app/status
- **Discord**: https://discord.gg/railway

## ✅ Checklist Final

- [ ] Deploy realizado com sucesso
- [ ] Health check respondendo: `/api/health`
- [ ] **Endpoint público funcionando**: `/api/project/scaffold-download`
- [ ] Logs sem erros críticos
- [ ] Domínio personalizado (opcional)
- [ ] Monitoring configurado

## 🚀 Endpoints Públicos

### ✅ Disponíveis em Produção
- `GET /api/health` - Health check
- `POST /api/project/scaffold-download` - Download de projeto ZIP

### 🔒 Privados (Desenvolvimento)
- `/api/project/scaffold` - Scaffold sem download
- `/api/entity/*` - Geração de entidades
- `/api/command/*` - Geração de comandos
- `/api/dotnet/*` - Gerenciamento .NET

> **Nota**: Para habilitar todas as rotas durante desenvolvimento, 
> edite `/src/app.ts` e descomente as importações e rotas privadas.
