# 📖 Documentação da API: Chatbot de Cinema

## 1\. Descrição do Projeto

Este projeto é um backend para um chatbot especialista em cinema, desenvolvido em **NestJS** e utilizando **TypeScript**. A API é capaz de interagir com um usuário para fornecer informações sobre filmes, como sinopse, elenco e avaliações, além de oferecer recomendações.

A inteligência do chatbot é alimentada pelo **Amazon Bedrock**, que analisa a intenção do usuário e gera respostas humanizadas. Os dados dos filmes são obtidos em tempo real através da API do **The Movie DB (TMDB)**, e o histórico das conversas é persistido em um banco de dados **MongoDB**.

## 2\. Arquitetura

A aplicação foi construída seguindo os princípios da **Clean Architecture** (ou Arquitetura Limpa), garantindo uma alta separação de conceitos, testabilidade e manutenibilidade. A estrutura é dividida em quatro camadas principais:

- **`Domain` (Camada de Domínio)**

  - **Localização:** `src/domain`
  - **Responsabilidade:** É o núcleo da aplicação. Contém as entidades de negócio puras (`Chat`, `Message`) e constantes, sem nenhuma dependência de frameworks ou tecnologias externas.

- **`Application` (Camada de Aplicação)**

  - **Localização:** `src/application`
  - **Responsabilidade:** Orquestra os fluxos de negócio. Contém os **Casos de Uso** (`SendMessageUseCase`, etc.) que definem as ações que a aplicação pode realizar. Também define as **Ports** (interfaces/classes abstratas como `ChatRepository` e `LlmProvider`) que são os contratos de comunicação com as camadas externas.

- **`Infrastructure` (Camada de Infraestrutura)**

  - **Localização:** `src/infra`
  - **Responsabilidade:** Contém os "detalhes" e as implementações concretas das `Ports`. É aqui que o código se conecta com tecnologias externas como MongoDB (`MongoChatRepository`), Amazon Bedrock (`BedrockProvider`) e a API do TMDB (`TmdbApiProvider`). Também gerencia a configuração do ambiente (`EnvModule`).

- **`Presentation` (Camada de Apresentação)**

  - **Localização:** `src/presentation`
  - **Responsabilidade:** Expõe a aplicação para o mundo exterior. Contém os **Controllers** que lidam com as requisições HTTP, os **DTOs** que validam os dados de entrada/saída, e os **Interceptors/Filters** que manipulam o ciclo de vida da requisição.

## 3\. Requisitos

Para rodar este projeto localmente, você precisará de:

- **Node.js** (v18 ou superior)
- **NPM**, **Yarn** ou. **Pnpm**
- **MongoDB** (uma instância local ou um serviço na nuvem como o MongoDB Atlas)
- **Git** para clonar o repositório
- Uma **Conta na AWS** com acesso ao **Amazon Bedrock** habilitado para os modelos desejados.
- Uma **Chave de API** do [The Movie DB (TMDB)](https://developer.themoviedb.org/docs/getting-started).

## 4\. Como Rodar o Projeto

Siga os passos abaixo para configurar e executar a aplicação em seu ambiente local.

### **Passo 1: Clonar o Repositório**

```bash
git clone https://github.com/rafacandido7/movies-bot
cd backend/cinema-chatbot
```

### **Passo 2: Instalar as Dependências**

```bash
npm install
```

### **Passo 3: Configurar Variáveis de Ambiente**

1.  Crie uma cópia do arquivo de exemplo `.env.example`:

    ```bash
    cp .env.example .env
    ```

2.  Abra o arquivo `.env` recém-criado e preencha com suas chaves e configurações:

    ```env
    # --- Configurações da Aplicação ---
    API_PORT=3002

    # --- Credenciais da AWS para o Bedrock ---
    AWS_ACCESS_KEY_ID=SUA_ACCESS_KEY_ID_AQUI
    AWS_SECRET_ACCESS_KEY=SUA_SECRET_ACCESS_KEY_AQUI
    AWS_REGION=us-east-1 # Ou a região onde seu Bedrock está habilitado

    # --- Configuração do Banco de Dados MongoDB ---
    DATABASE_URL=mongodb://localhost:27017 # Ou a URL do seu MongoDB Atlas
    DATABASE_NAME=cinema-chatbot

    # --- Configuração da API do The Movie DB ---
    TMDB_BASE_URL=https://api.themoviedb.org/3
    TMDB_READ_ACCESS_KEY=SUA_CHAVE_DE_LEITURA_DO_TMDB_AQUI
    ```

### **Passo 4: Rodar a Aplicação**

Garanta que sua instância do MongoDB esteja rodando e então inicie a aplicação NestJS em modo de desenvolvimento:

```bash
npm run start:dev
```

A API estará disponível em `http://localhost:3002`.

## 5\. Documentação da API (Swagger)\*\*

A API é auto-documentada usando **Swagger (OpenAPI)**. Com a aplicação rodando, acesse a seguinte URL no seu navegador para ver a documentação interativa:

**`http://localhost:3002/docs`**

Lá, você poderá ver todos os endpoints, os formatos de requisição e resposta, e até mesmo testar a API diretamente pelo navegador.

### **Endpoints Principais:**

- **`POST /chat`**: Envia uma nova mensagem para uma conversa. Inicia um novo chat se `chatId` não for fornecido.
- **`GET /chat`**: Retorna uma lista com o resumo de todas as conversas existentes.
- **`GET /chat/:id/messages`**: Retorna o histórico completo de mensagens para um `chatId` específico.

## 6\. Como Rodar o Frontend (Streamlit)

O frontend é uma aplicação web simples construída com a biblioteca **Streamlit** em Python. Ele interage com a API do backend para fornecer uma interface de chat para o usuário.

### **Requisitos do Frontend**

- **Python** (v3.9 ou superior)
- **pip** (gerenciador de pacotes do Python)

### **Passo 1: Preparar o Ambiente Python**

É uma forte recomendação usar um ambiente virtual (`venv`) para isolar as dependências do frontend.

1.  Abra um **novo terminal** e navegue até a pasta do seu projeto frontend.

    ```bash
    cd ../../frontend
    ```

2.  Crie um ambiente virtual:

    ```bash
    python3 -m venv venv
    ```

3.  Ative o ambiente virtual:

    - **No macOS ou Linux:**
      ```bash
      source venv/bin/activate
      ```
    - **No Windows (PowerShell):**
      ```bash
      .\venv\Scripts\Activate.ps1
      ```

### **Passo 2: Instalar as Dependências**

Com o ambiente virtual ativado, instale as bibliotecas necessárias.

```bash
pip install -r requirements.txt
```

### **Passo 3: Rodar a Aplicação Frontend**

1.  **Garanta que o Backend esteja rodando\!** A API do NestJS (`http://localhost:3002`) precisa estar ativa para que o frontend possa se comunicar com ela.

2.  No terminal (com o ambiente virtual ativado e na pasta do frontend), execute o seguinte comando:

    ```bash
    streamlit run app.py
    ```

3.  O Streamlit irá iniciar o servidor e fornecer uma URL no terminal, geralmente `http://localhost:8501`. Abra essa URL no seu navegador.

Pronto\! Agora você verá a interface do chatbot e poderá interagir com a sua API completa.
