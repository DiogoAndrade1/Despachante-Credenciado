# Despachante Credenciado — site inicial

## O que inclui
- Página responsiva em preto e amarelo.
- Formulário de solicitação de atendimento.
- Mensagem de confirmação após envio.
- Painel administrativo com login, listagem de solicitações e atualização de status.
- Contato por WhatsApp.

## Importante sobre os dados
Por segurança, esta versão **não coleta fotos de RG, selfie, assinatura manuscrita nem cópias de documentos**. O formulário coleta apenas dados básicos de contato e o tipo de serviço. Se for necessário analisar documentos em um processo legítimo, use um canal seguro, com aviso de privacidade, controle de acesso e retenção adequada. Emissão e habilitação devem seguir os canais e requisitos oficiais do Detran.

## Executar localmente
1. Instale Node.js 18 ou superior.
2. Copie `.env.example` para `.env`.
3. Defina uma senha administrativa nova e forte em `ADMIN_PASSWORD` e uma chave longa em `SESSION_SECRET`.
4. Execute `npm install` e `npm start`.
5. Abra `http://localhost:3000`.

## Publicar no Render
- Root Directory: deixe vazio se `package.json` e `server.js` estiverem na raiz do repositório.
- Build Command: `npm install`
- Start Command: `npm start`
- Em Environment, configure `ADMIN_USER`, `ADMIN_PASSWORD`, `SESSION_SECRET`, `WHATSAPP_NUMBER` e `BUSINESS_RESPONSIBLE`.
- Use HTTPS e armazenamento persistente para `data/` se quiser manter solicitações após reinicializações. Para uso real, prefira banco de dados gerenciado e proteção contra tentativas repetidas de login.

## Segurança
Não publique o arquivo `.env` nem coloque senhas no GitHub. A senha que você enviou na conversa deve ser considerada exposta; use outra senha exclusiva para o painel. Este projeto é um ponto de partida e precisa de revisão de segurança antes de receber dados reais.
