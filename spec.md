# Project Specification & Development Rules (spec.md)

Este arquivo define os padrões de código, estrutura, segurança e comportamento esperados para este projeto. Ele segue estritamente as especificações de `/reactspecs` e os padrões de excelência de design do `impeccable`.

## 1. Stack Tecnológico & Restrições

- **Linguagem & Runtime:** TypeScript (ES2022+ com `strict: true` ativado).
- **Biblioteca de UI:** React 18+ (Componentes Funcionais, Hooks nativos e State Imutável).
- **Estilização:** CSS Modules (`*.module.css`) com Tipagem Estática e Design Tokens centralizados em `src/styles/tokens.css`.
- **Validação de Esquemas:** Zod para validação em runtime e tipagem segura em fronteiras de I/O.
- **Bundler:** Vite com suporte a Serverless Functions via Vercel.
- **Backend / Serverless:** Node.js serverless functions em `api/` consumindo Firebase Admin e Firestore.
- **Restrição de Dependências:** É estritamente **PROIBIDO** o uso de bibliotecas legadas (jQuery, lodash) ou pacotes redundantes. Priorize soluções nativas do React e do ecossistema moderno.

## 2. Estrutura de Diretórios e Arquivos (Feature-Driven & Colocation)

O projeto segue a arquitetura modular orientada a domínios/funcionalidades:

```text
/ (root)
├── index.html                   # HTML base com <div id="root">
├── tsconfig.json                # TypeScript strict configuration
├── tsconfig.node.json           # TypeScript config para Vite
├── vite.config.ts               # Vite bundler com proxy para API local
├── package.json                 # Dependências do React, Zod, Firebase, Vite
├── PRODUCT.md                   # Registro durável de produto (Impeccable init)
├── /api                         # Serverless endpoints (recipes, book, parser, share)
├── /public                      # Mídias e arquivos estáticos puros
└── /src
    ├── main.tsx                 # Ponto de entrada / Inicialização do React (createRoot)
    ├── App.tsx                  # Composição global (Providers, Layout raiz e roteamento de visão)
    ├── /styles                  # Tokens de design e baseline (tokens.css, reset.css, global.css)
    ├── /components              # Componentes de UI genéricos e desacoplados (Button, Input, Modal, Toast, Icons)
    ├── /features                # Módulos verticais de negócio isolados
    │   ├── auth                 # Autenticação Firebase (services, hooks, AuthDialog)
    │   ├── recipes              # Acervo e leitura editorial (services, hooks, RecipeCard, MagazineView, FilterBar)
    │   └── recipe-editor        # Formulário e Jarvis IA (hooks, RecipeDialog, ImageUploader)
    ├── /hooks                   # Hooks utilitários
    ├── /types                   # Esquemas Zod e contratos TypeScript (recipe.ts, auth.ts)
    └── /utils                   # Funções puras (canvasImage, formatters, sanitize)
```

## 3. Padrões de Código & Qualidade (Clean Code & Pragmatic Programming)

- **Princípio da Responsabilidade Única (SRP):** Isole lógica de apresentação (JSX), lógica de negócio (Custom Hooks) e contratos (Types).
- **Proibição do `any`:** É estritamente vetado o uso de `any`. Utilize `unknown` com Type Guards ou Genéricos.
- **Imutabilidade Pura:** O estado do React deve ser estritamente imutável (`Readonly<T>`, `ReadonlyArray<T>`).
- **Validação de Fronteira:** Todos os dados recebidos via API externa ou formulários devem ser validados por esquemas do Zod antes de serem propagados pelo estado.
- **Prevenção de XSS:** Sem `dangerouslySetInnerHTML`. URLs dinâmicas sanitizadas com `sanitizeUrl`.
- **Performance:** Chaves estáveis e persistentes (`key={recipe._id}`). Evitar índice de array em listas dinâmicas.

## 4. Versionamento e Git

- **Execução Exclusiva do Desenvolvedor:** O assistente de IA está proibido de realizar commits ou pushs automáticos. O desenvolvedor deve validar todas as alterações e executar os comandos git em seu próprio terminal.
