const form = document.querySelector('#chat-form');
const input = document.querySelector('#message-input');
const messages = document.querySelector('#messages');
const sendButton = document.querySelector('#send-button');
const newChatButton = document.querySelector('#new-chat');
const suggestions = document.querySelector('#suggestions');

const newSessionId = () => crypto.randomUUID();
let sessionId = localStorage.getItem('runflow-session-id') ?? newSessionId();
localStorage.setItem('runflow-session-id', sessionId);

function addMessage(text, role, isError = false) {
  const article = document.createElement('article');
  article.className = `message ${role}-message${isError ? ' error-message' : ''}`;
  if (role === 'assistant') {
    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.setAttribute('aria-hidden', 'true');
    avatar.textContent = 'R';
    article.append(avatar);
  }
  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  const paragraph = document.createElement('p');
  appendFormattedText(paragraph, text);
  bubble.append(paragraph);
  article.append(bubble);
  messages.append(article);
  messages.scrollTop = messages.scrollHeight;
}

function appendFormattedText(container, text) {
  const lines = text.split('\n');

  lines.forEach((line, lineIndex) => {
    const fragments = line.split(/(\*\*[^*]+\*\*)/g);
    fragments.forEach((fragment) => {
      if (fragment.startsWith('**') && fragment.endsWith('**')) {
        const strong = document.createElement('strong');
        strong.textContent = fragment.slice(2, -2);
        container.append(strong);
      } else {
        container.append(document.createTextNode(fragment));
      }
    });

    if (lineIndex < lines.length - 1) container.append(document.createElement('br'));
  });
}

function setBusy(busy) {
  input.disabled = busy;
  sendButton.disabled = busy;
  document.querySelector('#typing')?.remove();
  if (busy) {
    const article = document.createElement('article');
    article.id = 'typing';
    article.className = 'message assistant-message typing';
    article.innerHTML = '<div class="avatar" aria-hidden="true">R</div><div class="bubble" aria-label="Assistente digitando"><i></i><i></i><i></i></div>';
    messages.append(article);
    messages.scrollTop = messages.scrollHeight;
  }
}

async function sendMessage(text) {
  const trimmed = text.trim();
  if (!trimmed || sendButton.disabled) return;
  suggestions?.remove();
  addMessage(trimmed, 'user');
  input.value = '';
  input.style.height = 'auto';
  setBusy(true);
  try {
    const response = await fetch('/chat', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ sessionId, message: trimmed }),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error?.message ?? 'Não foi possível enviar a mensagem.');
    addMessage(payload.data.message, 'assistant');
  } catch (error) {
    addMessage(error.message ?? 'Ocorreu um erro inesperado. Tente novamente.', 'assistant', true);
  } finally {
    setBusy(false);
    input.focus();
  }
}

form.addEventListener('submit', (event) => { event.preventDefault(); sendMessage(input.value); });
input.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); form.requestSubmit(); }
});
input.addEventListener('input', () => {
  input.style.height = 'auto';
  input.style.height = `${Math.min(input.scrollHeight, 160)}px`;
});
suggestions.addEventListener('click', (event) => {
  const button = event.target.closest('[data-message]');
  if (button) sendMessage(button.dataset.message);
});
newChatButton.addEventListener('click', () => {
  sessionId = newSessionId();
  localStorage.setItem('runflow-session-id', sessionId);
  window.location.reload();
});
