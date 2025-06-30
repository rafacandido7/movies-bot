import streamlit as st
import requests
import json
from typing import Union, List, Dict, Any

API_URL = "http://localhost:3002" 
CHAT_ENDPOINT = f"{API_URL}/chat"

def get_all_chats() -> List[Dict[str, Any]]:
    """Busca a lista de todos os chats existentes."""
    try:
        response = requests.get(CHAT_ENDPOINT)
        response.raise_for_status()
        return response.json().get('data', [])
    except requests.exceptions.RequestException:
        st.sidebar.error("Erro de conexão com a API.")
        return []
    except (KeyError, json.JSONDecodeError):
        st.sidebar.error("Resposta da API em formato inesperado.")
        return []

def get_chat_messages(chat_id: str) -> List[Dict[str, Any]]:
    """Busca o histórico de mensagens de um chat específico."""
    if not chat_id:
        return []
    try:
        response = requests.get(f"{CHAT_ENDPOINT}/{chat_id}/messages")
        response.raise_for_status()
        return response.json().get('data', [])
    except requests.exceptions.RequestException:
        st.error("Erro ao carregar o histórico do chat.")
        return []

def post_message(text: str, chat_id: Union[str, None]) -> Union[Dict[str, Any], None]:
    """Envia uma nova mensagem para o backend."""
    payload = {"text": text, "chatId": chat_id}
    try:
        response = requests.post(CHAT_ENDPOINT, json=payload)
        response.raise_for_status()
        return response.json().get('data')
    except requests.exceptions.RequestException:
        st.error("Erro ao enviar a mensagem.")
        return None

def start_new_chat():
    """Reseta o estado da sessão para iniciar uma nova conversa."""
    st.session_state.messages = []
    st.session_state.chat_id = None
    st.rerun()

def load_chat(chat_id: str):
    """Carrega um chat existente e seu histórico de mensagens."""
    if st.session_state.get('chat_id') == chat_id:
        return # Evita recarregar o chat que já está ativo
        
    st.session_state.chat_id = chat_id
    with st.spinner("Carregando histórico..."):
        messages_from_db = get_chat_messages(chat_id)
        st.session_state.messages = [
            {
                "role": "assistant" if msg["role"] == "ia" else "user",
                "content": msg["content"]
            }
            for msg in messages_from_db
        ]
    st.rerun()

# --- Renderização Principal (Ponto de Entrada) ---

def main():
    st.set_page_config(page_title="Chatbot de Cinema", layout="centered", initial_sidebar_state="auto")

    # Inicialização do estado da sessão
    if "messages" not in st.session_state:
        st.session_state.messages = []
    if "chat_id" not in st.session_state:
        st.session_state.chat_id = None

    # --- Barra Lateral ---
    with st.sidebar:
        st.header("Minhas Conversas")
        if st.button("➕ Novo Chat", use_container_width=True):
            start_new_chat()
        st.markdown("---")
        for chat in reversed(get_all_chats()):
            chat_id = chat.get("_id")
            chat_title = chat.get("title", f"Chat {chat_id[:8]}...")
            if st.button(chat_title, key=chat_id, use_container_width=True):
                load_chat(chat_id)

    # --- Janela de Chat Principal ---
    st.title("🤖 Chatbot Especialista em Cinema")
    st.write("Seu assistente para tudo sobre o mundo dos filmes.")
    st.markdown("---")

    # Exibe o histórico de mensagens que está na memória da sessão
    for message in st.session_state.messages:
        with st.chat_message(message["role"]):
            st.markdown(message["content"])

    # Captura o input do usuário (aqui está a lógica principal corrigida)
    if prompt := st.chat_input("Qual filme você quer saber hoje?"):
        # 1. Adiciona a mensagem do usuário ao estado da sessão
        st.session_state.messages.append({"role": "user", "content": prompt})
        
        # 2. Renderiza a mensagem do usuário na tela IMEDIATAMENTE
        with st.chat_message("user"):
            st.markdown(prompt)

        # 3. Mostra um spinner enquanto o bot pensa e chama a API
        with st.spinner("Pensando..."):
            response_data = post_message(prompt, st.session_state.chat_id)

        # 4. Se a API respondeu, processa e renderiza a resposta do bot
        if response_data:
            bot_response = response_data.get("responseText", "Desculpe, não consegui obter uma resposta.")
            
            # Atualiza o ID do chat no estado da sessão (crucial para novas conversas)
            st.session_state.chat_id = response_data.get("chatId")
            
            # Adiciona a resposta do bot ao estado da sessão
            st.session_state.messages.append({"role": "assistant", "content": bot_response})
            
            # Renderiza a resposta do bot na tela
            with st.chat_message("assistant"):
                st.markdown(bot_response)
        else:
            # Mostra uma mensagem de erro na própria tela de chat
            with st.chat_message("assistant"):
                st.error("Ocorreu um erro ao me comunicar com o servidor. Tente novamente.")


if __name__ == "__main__":
    main()