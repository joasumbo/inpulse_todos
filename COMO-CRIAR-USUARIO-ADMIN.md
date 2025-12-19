# Como Criar Usuário Admin no Supabase

## Passo 1: Ir para o Painel Supabase
1. Acesse: https://supabase.com/dashboard/project/mqkqfpbaxnjtadinctek
2. No menu lateral, clique em **Authentication** → **Users**

## Passo 2: Criar Usuário
1. Clique em **Add User** → **Create new user**
2. Preencha:
   - **Email:** admin@inpulse.pt (ou o email que você quiser)
   - **Password:** Escolha uma senha forte e guarde
   - **Auto Confirm User:** ✅ Marque esta opção (importante!)
3. Clique em **Create User**

## Passo 3: Testar o Painel
Depois de criar o usuário, você pode testar o painel admin:

1. No terminal, execute:
   ```
   cd c:\Users\Bravantic\Desktop\inpulsev2\inpulse-admin
   npm run dev
   ```

2. Abra no navegador: http://localhost:5173

3. Faça login com o email e senha que você criou

## O que o painel pode fazer:
✅ Dashboard com estatísticas
✅ Configurações do site (nome, email, telefone)
✅ Aparência (logo, cores)
✅ Gerenciar páginas
✅ Sistema de blog completo
✅ Inbox de contatos
✅ Editor de menu
✅ Redes sociais

Depois de testar localmente, faremos o deploy no Vercel!
