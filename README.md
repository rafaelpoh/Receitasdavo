# 👵 Receitas da Vó — Seu Livro de Receitas Digital Minimalista

> Um acervo culinário elegante, limpo e livre de distrações, com visual "modo revista" e importação automática de receitas por Inteligência Artificial.

---

## 📖 A Ideia

O **Receitas da Vó** nasceu para resgatar a beleza e simplicidade dos antigos cadernos de receitas de família, adaptando-os para a era digital. Longe de sites de culinária modernos cheios de anúncios invasivos, pop-ups de newsletter e textos desnecessariamente longos, esta aplicação foca no que realmente importa: os ingredientes, o modo de preparo e uma bela foto do prato.

A interface foi projetada seguindo um estilo visual **editorial ("modo revista")**, priorizando espaços em branco, tipografia moderna e transições suaves.

---

## ✨ Funcionalidades Principais

*   📖 **Estética Editorial (Modo Revista):** Visual minimalista inspirado em design impresso clássico. O foco é total no conteúdo das receitas, otimizando a legibilidade.
*   🧠 **Importador Inteligente (Jarvis IA):** Com a ajuda do Gemini Pro, você pode colar o link de qualquer site de culinária (TudoGostoso, Panelinha, etc.) ou digitar um texto bruto de ingredientes para que o assistente estruture o título, categoria, ingredientes e passos de preparo automaticamente.
*   🖼️ **Otimização via Canvas (Sem Dependência de Storage):** O aplicativo redimensiona a imagem no frontend localmente via HTML5 Canvas (mantendo o aspecto original e um limite de 800px a 80% de qualidade). A imagem leve resultante (~50KB a 100KB) é salva em formato Base64 direto no banco de dados. Isso elimina custos e a necessidade de configuração do Firebase Storage!
*   ☁️ **Banco de Dados no Cloud Firestore:** Persistência ágil e escalável de todas as suas receitas e imagens no Firebase.
*   🔗 **Página de Compartilhamento Dinâmica:** Compartilhe suas receitas favoritas com amigos ou familiares de forma leve por meio da rota pública `/share.html`.

---

## 🛠️ Tecnologias Utilizadas

### Frontend (Vanilla & Responsivo)
*   **HTML5 & CSS3:** Layouts baseados em CSS Grid e Flexbox com Custom Properties (variáveis) para controle estrito de cores e espaçamentos.
*   **Vanilla JS (ES6+):** Código limpo em JS nativo, sem frameworks pesados de frontend para máxima performance e velocidade de carregamento.
*   **HTML5 Canvas API:** Processamento e compressão de imagens em tempo de execução no dispositivo do usuário.

### Backend (Serverless & Cloud)
*   **Vercel Serverless Functions:** Endpoints de API rápidos baseados em Node.js rodando na infraestrutura da Vercel.
*   **Firebase Admin SDK:** Integração direta e segura com o Firestore Database.
*   **Google Gemini Pro API:** Integração de inteligência artificial para estruturação inteligente das receitas de fontes externas.

---

## 🚀 Como Rodar o Projeto Localmente

### Pré-requisitos
*   [Node.js](https://nodejs.org/) instalado.
*   Uma conta no [Firebase](https://console.firebase.google.com/) com um projeto configurado (Firestore ativado).
*   Uma chave de API do [Google Gemini](https://ai.google.dev/).

### Passo a Passo

1.  **Clonar o repositório:**
    ```bash
    git clone https://github.com/seu-usuario/Receitasdavo.git
    cd Receitasdavo
    ```

2.  **Instalar dependências:**
    ```bash
    npm install
    ```

3.  **Configurar variáveis de ambiente:**
    Crie um arquivo `.env` na raiz do projeto contendo as chaves do Firebase e do Gemini (a variável do bucket do Storage não é mais necessária):
    ```env
    FIREBASE_PROJECT_ID=seu-projeto-id
    FIREBASE_CLIENT_EMAIL=seu-client-email@seu-projeto-id.iam.gserviceaccount.com
    # Nota: A chave privada deve conter as quebras de linha '\n' representadas literalmente
    FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0B...\n-----END PRIVATE KEY-----\n"

    GEMINI_API_KEY=sua-gemini-api-key
    ```

4.  **Iniciar o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```
    A aplicação estará acessível em `http://localhost:3000`.

---

## 🌐 Deploy na Vercel

Você pode implantar o **Receitas da Vó** diretamente na Vercel através da integração com o GitHub:

1.  Crie um novo projeto na Vercel e conecte o repositório importado.
2.  Nas configurações de importação, adicione as mesmas variáveis de ambiente configuradas no `.env` local.
3.  Faça o deploy. A Vercel cuidará de servir a interface estática e implantar as funções serverless localizadas na pasta `/api`.
