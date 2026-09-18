# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Cozinheiros domésticos, entusiastas da gastronomia e guardiões de receitas de família que desejam armazenar, organizar e consultar suas receitas prediletas em uma interface limpa, sem anúncios intrusivos ou layouts poluídos.

## Product Purpose

Proporcionar uma experiência de leitura e registro culinário no estilo "modo revista" (editorial magazine), combinando tipografia elegante, legibilidade impecável na cozinha (com checklist interativo de ingredientes) e importação inteligente assistida por IA (Jarvis / Gemini) de qualquer link ou texto bruto.

## Positioning

Diferente de grandes portais culinários repletos de anúncios, banners e pop-ups agressivos, o Receitas da Vó posiciona-se como um acervo pessoal minimalista, ágil e focado no essencial: ingredientes claros, passos bem ritmados e um visual que homenageia livros clássicos de gastronomia com tecnologias web modernas.

## Operating Context

Uso no smartphone ou tablet apoiado na bancada da cozinha durante o preparo de refeições, além do desktop para catalogação e curadoria do acervo familiar. A interface precisa suportar toques com dedos úmidos, alto contraste de leitura e checklists de ingredientes marcáveis.

## Capabilities and Constraints

- **Sessão Anônima & Nuvem**: Inicialização automática de livro de receitas (`bookId`) persistido localmente e integrado ao Firestore.
- **Autenticação Firebase**: Login/cadastro opcional com email e senha para assegurar propriedade e permissão de edição e exclusão de receitas.
- **Importação Inteligente (Jarvis IA)**: Integração com a API Gemini para transformar links da web ou textos desestruturados em receitas formatadas.
- **Otimização de Imagens no Cliente**: Redimensionamento e compressão via HTML5 Canvas (máx 800px, JPEG 80%) antes de salvar, minimizando latência e custos de armazenamento.
- **Compartilhamento**: Geração de links sociais com suporte a OpenGraph SSR via Vercel Serverless.

## Brand Commitments

- **Nome**: Receitas da Vó - Seu Livro Digital Minimalista.
- **Estética Editorial**: Tipografia serifada clássica (*Playfair Display*) aliada a uma sans moderna (*Outfit*), tons quentes e terrosos (terracota `#b84c24`, creme editorial `#fbf9f6`, carvão suave `#2a201b`).
- **Linguagem**: Acolhedora, direta, elegante e focada na culinária afetiva.

## Product Principles

1. **Clareza Editorial Acima de Tudo**: Sem distrações visuais, banners ou elementos concorrendo com a receita.
2. **Utilidade Prática na Cozinha**: Textos legíveis a distância, passos sequenciais e ingredientes riscáveis para evitar esquecimento.
3. **Agilidade com IA**: Facilitar o cadastro permitindo que qualquer receita copiada da internet seja estruturada com um único clique.
4. **Zero Confiança e Integridade**: Validação estrita de entradas, sem risco de injeção de código ou perda de dados.
