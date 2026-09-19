# 👵 Receitas da Vó — Livro de Receitas Digital Minimalista

> Um acervo culinário elegante, limpo e livre de distrações, com visual editorial "modo revista", tipografia refinada e importação inteligente de receitas assistida por Inteligência Artificial (Google Gemini).

---

## 📖 Sobre o Projeto

O **Receitas da Vó** nasceu para resgatar a elegância, a simplicidade e a afetividade dos antigos livros de receitas de família, unindo essa nostalgia às melhores práticas da web moderna.

Diferente dos grandes portais de culinária — repletos de anúncios invasivos, rastreadores, banners promocionais e histórias desnecessariamente longas —, esta aplicação é pensada exclusivamente para quem está cozinhando:
- **Foco absoluto no conteúdo:** ingredientes organizados, modo de preparo em etapas claras e fotografia do prato.
- **Estética editorial ("Modo Revista"):** diagramação inspirada em periódicos e livros clássicos de gastronomia, combinando a tipografia clássica *Playfair Display* com a modernidade geométrica da *Outfit*, sob uma paleta acolhedora e terrosa (terracota, creme editorial e carvão suave).
- **Usabilidade na bancada da cozinha:** ingredientes com checklist interativo riscável ao toque, facilitando o acompanhamento durante o preparo.

---

## ✨ Funcionalidades Principais

* 📖 **Modo Revista Editorial:** Visual minimalista de alta legibilidade, com suporte a categorização rápida (Doces, Salgados, Massas, Sobremesas, etc.).
* 🧠 **Importador Inteligente (Jarvis IA):** Com a API do Google Gemini, basta colar o link de qualquer site culinário ou um texto bruto de ingredientes/instruções para que a IA estruture automaticamente título, categoria, lista de ingredientes e etapas de preparo.
* 🖼️ **Otimização de Imagens no Cliente (Canvas API):** As fotos enviadas são redimensionadas e comprimidas localmente no navegador via HTML5 Canvas (máximo de 800px a 80% de qualidade JPEG). Isso elimina a necessidade de serviços de storage pagos e acelera o carregamento.
* 🔐 **Autenticação Firebase:** Suporte a login e cadastro via e-mail e senha para proteção de autoria, edição e exclusão de receitas, mantendo compatibilidade nativa com livros de receitas criados anonimamente.
* ☁️ **Persistência em Nuvem (Cloud Firestore):** Armazenamento em tempo real seguro e escalável das receitas e livros digitais.
* 🔗 **Compartilhamento Social com OpenGraph SSR:** Rota `/share.html?id=...` processada via Serverless Function com renderização de metatags OpenGraph dinâmicas, permitindo cartões enriquecidos no WhatsApp, Telegram, X (Twitter) e outras redes.

---

## 🛠️ Tecnologias Utilizadas

### Frontend
* **[React 18](https://react.dev/):** Componentes funcionais modernos, hooks e imutabilidade estrita.
* **[TypeScript](https://www.typescriptlang.org/):** Tipagem estática rigorosa em modo estrito (`strict: true`).
* **[Vite 5](https://vitejs.dev/):** Ferramenta de build ultrarrápida com Hot Module Replacement (HMR) e divisão otimizada de chunks (`vendor`, `firebase`).
* **[CSS Modules](https://github.com/css-modules/css-modules):** Estilização modular e escopada por componente, sem vazamento de seletores.
* **Design Tokens:** Variáveis CSS padronizadas centralizadas em `src/styles/tokens.css`.
* **[Zod](https://zod.dev/):** Validação de esquemas e segurança de tipos em tempo de execução para contratos de API e formulários.

### Backend & Nuvem
* **[Vercel Serverless Functions](https://vercel.com/docs/functions):** Endpoints Node.js em `/api` para gerenciamento de livros, receitas, parser de IA e compartilhamento OpenGraph.
* **[Firebase Admin SDK](https://firebase.google.com/docs/admin/setup) & [Client SDK](https://firebase.google.com/docs/web/setup):** Firestore Database e Firebase Authentication.
* **[Google Gemini API](https://ai.google.dev/):** Inteligência Artificial para extração e estruturação automática de receitas.

---

## 📁 Estrutura do Repositório

O projeto adota uma arquitetura modular orientada a funcionalidades (*Feature-Driven*):

```text
Receitasdavo/
├── api/                    # Funções Serverless (Vercel)
│   ├── _utils/             # Instância e credenciais do Firebase Admin
│   ├── book/               # Endpoints de criação de livro digital
│   ├── parser/             # Integração com Gemini API para extração inteligente
│   ├── recipes/            # CRUD de receitas no Firestore
│   └── share.js            # Renderizador SSR de OpenGraph para compartilhamento
├── public/                 # Arquivos estáticos servidos diretamente pelo Vite
│   ├── css/                # Folhas de estilo da página de compartilhamento SSR
│   └── favicon.svg         # Ícone da aplicação
├── src/                    # Código-fonte da aplicação React
│   ├── components/         # Componentes de UI genéricos (Button, Input, Modal, Toast, Icons)
│   ├── features/           # Módulos verticais de negócio
│   │   ├── auth/           # Autenticação (hooks, serviços e AuthDialog)
│   │   ├── recipes/        # Catálogo de receitas, MagazineView e FilterBar
│   │   └── recipe-editor/  # Criação/edição de receitas e importador Jarvis IA
│   ├── styles/             # Tokens globais (tokens.css, reset.css, global.css)
│   ├── types/              # Contratos TypeScript e esquemas Zod (recipe.ts, auth.ts)
│   ├── utils/              # Funções utilitárias puras (canvasImage, formatters, sanitize)
│   ├── App.tsx             # Componente raiz e orquestração de layouts
│   └── main.tsx            # Inicialização React (createRoot)
├── index.html              # HTML base da aplicação Vite
├── share-template.html     # Template HTML base utilizado pelo endpoint /api/share
├── vercel.json             # Configuração de rotas e build da Vercel
├── vite.config.ts          # Configuração do bundler Vite com proxy de API
├── tsconfig.json           # Configurações do compilador TypeScript
└── package.json            # Scripts e dependências do ecossistema
```

---

## 🚀 Como Executar Localmente

### Pré-requisitos
* [Node.js](https://nodejs.org/) (versão 18 ou superior)
* Projeto no [Firebase Console](https://console.firebase.google.com/) com:
  - **Cloud Firestore** ativado
  - **Firebase Authentication** ativado (provedor E-mail/Senha)
  - Chave de conta de serviço gerada (para o Firebase Admin SDK)
* Chave de API do [Google Gemini](https://ai.google.dev/)

---

### Passo a Passo

1. **Clonar o repositório:**
   ```bash
   git clone https://github.com/seu-usuario/Receitasdavo.git
   cd Receitasdavo
   ```

2. **Instalar as dependências:**
   ```bash
   npm install
   ```

3. **Configurar as variáveis de ambiente:**
   Crie um arquivo `.env` na raiz do projeto com as credenciais:

   ```env
   # Firebase Admin SDK (para as rotas em /api)
   FIREBASE_PROJECT_ID=seu-projeto-id
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@seu-projeto-id.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nSUA_CHAVE_AQUI\n-----END PRIVATE KEY-----\n"

   # Google Gemini API (para o importador inteligente)
   GEMINI_API_KEY=sua-chave-gemini-api
   ```

   > **Nota sobre a chave privada:** Certifique-se de manter as quebras de linha `\n` como caracteres literais entre aspas duplas.

4. **Executar a aplicação:**

   * **Modo Padrão (Frontend Vite):**
     ```bash
     npm run dev
     ```
     O Vite iniciará em `http://localhost:5173`. As chamadas para `/api/*` serão redirecionadas via proxy local para `http://localhost:3000`.

   * **Modo Completo (Vercel CLI com Serverless):**
     Se desejar executar tanto o frontend quanto as Serverless Functions locais simultaneamente:
     ```bash
     npx vercel dev
     ```
     A aplicação completa estará acessível em `http://localhost:3000`.

---

## 📜 Scripts Disponíveis

| Comando | Descrição |
| :--- | :--- |
| `npm run dev` | Inicia o servidor local de desenvolvimento com Vite. |
| `npm run build` | Executa a verificação estrita de tipos (`tsc`) e gera o bundle de produção em `dist/`. |
| `npm run preview` | Executa um servidor local para inspecionar o bundle de produção compilado. |

---

## 🌐 Deploy na Vercel

O projeto está configurado com [Vercel](https://vercel.com/) out-of-the-box (`vercel.json`):

1. Conecte seu repositório no painel da **Vercel**.
2. Nas configurações do projeto (**Project Settings > Environment Variables**), adicione as mesmas variáveis do seu `.env`:
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY`
   - `GEMINI_API_KEY`
3. Execute o deploy. A Vercel executará automaticamente `npm run build`, distribuirá o frontend otimizado a partir de `dist` e registrará os endpoints de `/api`.

---

## 📄 Licença

Distribuído sob a licença MIT. Feito com afeto para preservar os sabores e memórias da família.
