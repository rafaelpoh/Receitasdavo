# Project Specification & Development Rules (spec.md)

Este arquivo define os padrões de código, estrutura, segurança e comportamento esperados para este projeto. Ele deve ser lido e seguido estritamente por desenvolvedores e assistentes de IA.

## 1. Stack Tecnológico & Limitações

- **Linguagem:** JavaScript (Vanilla ES6+).
- **Marcação:** HTML5 Semântico.
- **Estilização:** CSS3 (Vanilla).
- **Restrição Absoluta:** NÃO utilizar frameworks (React, Vue, Angular), bibliotecas de UI (Bootstrap, Tailwind) ou jQuery.
- **Gerenciamento de Pacotes:** Evitar dependências npm desnecessárias.

## 2. Estrutura de Diretórios e Arquivos

### Estrutura do Projeto Web Padrão
```text
/ (root)
├── index.html          # Ponto de entrada principal
├── spec.md             # Regras de desenvolvimento (este arquivo)
├── share-template.html # Template dinâmico de compartilhamento de receitas
├── /css                # Estilos
│   ├── reset.css       # Limpeza e padronização visual
│   ├── var.css         # Variáveis e Tokens de design (:root)
│   └── skin.css        # Layout, visuais e regras responsivas unificadas
└── /js                 # Lógica da aplicação
    ├── main.js         # Entrada e controle de fluxo do app
    └── utils.js        # Utilitários globais reutilizáveis
```

## 3. Padrões de Código & Qualidade (Clean Code)

### 3.1 JavaScript
- **Modularização:** Utilize `import` e `export` (ES Modules) para separar responsabilidades. Não misture todo o escopo em um único script.
- **Nomenclatura:**
  - Variáveis e Funções: `camelCase` (ex: `toggleModal`, `userData`).
  - Constantes: `UPPER_SNAKE_CASE` (ex: `API_BASE_URL`, `MAX_RETRY_COUNT`).
  - Classes (se usadas): `PascalCase`.
- **Princípio DRY (Don't Repeat Yourself):** Lógicas executadas repetidamente devem ser extraídas para `utils.js`.
- **Evitar Poluição Global:** Não declare variáveis no escopo global (`window`). Use escopos locais e módulos encapsulados.

### 3.2 HTML & Acessibilidade (A11y)
- **Semântica:** Use `<header>`, `<main>`, `<footer>`, `<nav>`, `<article>` em vez de `<div>` genéricas sempre que apropriado.
- **Ações:** Botões (`<button>`) são para interações/ações; Links (`<a>`) são para navegação. Nunca inverta estes papéis.
- **Mídia:** Imagens devem conter o atributo `alt` descritivo.
- **Formulários:** Todo `<input>` ou `<textarea>` deve ter um `<label>` associado via atributo `for` correspondendo ao `id` do elemento.
- **Ordem de Carregamento de Estilos (Crítico):** O CSS deve ser linkado no `<head>` estritamente nesta ordem:
  1. `reset.css` (Limpa estilos padrões do navegador)
  2. `var.css` (Define as variáveis de design tokens)
  3. `skin.css` (Aplica a estética geral e layout responsivo)
- **Scripts:** Devem ser carregados com o atributo `defer` ou `type="module"` no final do `<body>` para evitar o bloqueio da renderização inicial.

### 3.3 CSS
- **Metodologia:** Mantenha o CSS simples e plano, evitando aninhamentos profundos.
- **Nomenclatura:** Use classes descritivas e legíveis (ex: `.recipe-card`, `.btn-primary`).
- **Responsividade:** Mobile-first. Implemente layouts usando CSS Grid e Flexbox com media queries para se adaptar a diferentes dispositivos.
- **Arquivos CSS:**
  - `reset.css`: Reset minimalista para limpar margens, paddings e tamanhos inconsistentes.
  - `var.css`: Contém EXCLUSIVAMENTE as variáveis CSS no escopo `:root`. Nenhuma regra de layout ou cor crua é permitida fora deste arquivo.
  - `skin.css`: Contém todas as regras de visual, estrutura, componentes e responsividade.
- **Uso de Variáveis:** Nunca utilize cores hexadecimais, HSL cruas ou pixels arbitrários fora de `var.css`. Consuma sempre as variáveis declaradas (ex: `color: var(--color-accent)`).

## 4. Segurança (Crítico)

- **Prevenção de XSS (Cross-Site Scripting):**
  - **PROIBIDO:** Uso de `innerHTML` para renderizar qualquer entrada de dados que venha de inputs de formulários ou APIs de terceiros.
  - **OBRIGATÓRIO:** Utilize `textContent` para strings simples de texto.
  - **Criação do DOM:** Para elementos complexos dinâmicos, crie-os via `document.createElement()`, defina os atributos via Javascript e faça `appendChild()`.
- **Validação de Inputs:** Sempre valide formatos, tamanhos e tipos de dados no cliente e servidor.
- **Dados Sensíveis:** Nunca commite chaves de API, credenciais ou tokens diretamente no repositório. Utilize variáveis de ambiente (`process.env`).

## 5. Performance

- **DOM Caching:** Armazene referências de elementos do DOM em variáveis persistentes fora de loops ou handlers de eventos frequentes.
- **Event Delegation:** Sempre utilize delegação de eventos para grupos de elementos interativos (como listas de ingredientes ou acervos de cards) para economizar recursos e memória.
- **Não-Bloqueio:** Imagens devem ser otimizadas localmente via Canvas antes de serem enviadas para o banco de dados.

## 6. Versionamento e Git

- **Execução Exclusiva do Desenvolvedor:** O assistente de IA está proibido de realizar commits ou pushs automáticos. O desenvolvedor deve validar todas as alterações e executar os comandos git em seu próprio terminal.
