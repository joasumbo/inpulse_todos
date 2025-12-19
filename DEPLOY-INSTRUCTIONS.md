# 🚀 INSTRUÇÕES DE DEPLOY - João Sumbo

## ✅ Painel Admin no Vercel

### Passo 1: Instalar Vercel CLI
```bash
npm install -g vercel
```

### Passo 2: Login no Vercel
```bash
vercel login
```

### Passo 3: Deploy do Admin
```bash
cd inpulse-admin
vercel
```

Siga o assistente:
- **Set up and deploy?** → Yes
- **Which scope?** → Sua conta
- **Link to existing project?** → No
- **What's your project's name?** → inpulse-admin
- **In which directory is your code located?** → ./
- **Want to override the settings?** → Yes
  - **Build Command:** `npm run build`
  - **Output Directory:** `dist`
  - **Development Command:** `npm run dev`

### Passo 4: Configurar Variáveis de Ambiente

No painel do Vercel (vercel.com):
1. Vá em **Settings** → **Environment Variables**
2. Adicione:
   - `VITE_SUPABASE_URL` = `https://mqkqfpbaxnjtadinctek.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `(sua chave do .env.local)`

### Passo 5: Configurar Domínio

1. No Vercel, vá em **Settings** → **Domains**
2. Adicione: `admin.inpulse-events.com`
3. Configure DNS:
   - Tipo: `CNAME`
   - Name: `admin`
   - Value: `cname.vercel-dns.com`

### Passo 6: Redesploy

```bash
vercel --prod
```

---

## 🎯 Projeto Completo

**Site Público:** https://inpulse-events.com
**Painel Admin:** https://admin.inpulse-events.com (após deploy)

### Recursos Implementados

✅ Site público totalmente funcional
✅ Painel CMS completo com autenticação
✅ Integração Supabase (banco de dados + storage)
✅ Formulário de contato salva no banco
✅ Cores e logo dinâmicos do banco de dados
✅ Skeleton loaders para melhor UX
✅ Notificações personalizadas
✅ Sistema de blog preparado
✅ Menu dinâmico
✅ Responsive design

---

**Desenvolvido por João Sumbo - 2025**
