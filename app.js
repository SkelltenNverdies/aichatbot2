let messages = [];
let chats = JSON.parse(localStorage.getItem('qwen_chats') || '{}');
let currentChatId = null;
let attachments = [];

const chatContainer = document.getElementById('chatContainer');
const chatForm = document.getElementById('chatForm');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const attachBtn = document.getElementById('attachBtn');
const fileInput = document.getElementById('fileInput');
const attachmentPreview = document.getElementById('attachmentPreview');
const welcome = document.getElementById('welcome');
const chatList = document.getElementById('chatList');
const newChatBtn = document.getElementById('newChatBtn');
const menuBtn = document.getElementById('menuBtn');
const sidebar = document.getElementById('sidebar');
const modelSelect = document.getElementById('modelSelect');
const currentChatTitle = document.getElementById('currentChatTitle');

messageInput.addEventListener('input', () => {
  messageInput.style.height = 'auto';
  messageInput.style.height = Math.min(messageInput.scrollHeight, 200) + 'px';
  sendBtn.disabled = !messageInput.value.trim() && attachments.length === 0;
});

messageInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    if (!sendBtn.disabled) chatForm.dispatchEvent(new Event('submit'));
  }
});

attachBtn.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (e) => {
  const files = Array.from(e.target.files);
  files.forEach(file => {
    if (attachments.length >= 5) {
      alert('Maksimal 5 file per pesan');
      return;
    }
    if (file.size > 4.5 * 1024 * 1024) {
      alert('File ' + file.name + ' terlalu besar (maks 4.5MB untuk Vercel)');
      return;
    }
    attachments.push(file);
    renderAttachmentPreview();
  });
  fileInput.value = '';
  sendBtn.disabled = !messageInput.value.trim() && attachments.length === 0;
});

function renderAttachmentPreview() {
  attachmentPreview.innerHTML = '';
  attachments.forEach((file, index) => {
    const item = document.createElement('div');
    item.className = 'preview-item';
    if (file.type.startsWith('image/')) {
      const img = document.createElement('img');
      img.src = URL.createObjectURL(file);
      item.appendChild(img);
    } else {
      const icon = document.createElement('span');
      icon.textContent = '📄';
      item.appendChild(icon);
    }
    const name = document.createElement('span');
    name.textContent = file.name;
    item.appendChild(name);
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-btn';
    removeBtn.innerHTML = '×';
    removeBtn.onclick = () => {
      attachments.splice(index, 1);
      renderAttachmentPreview();
      sendBtn.disabled = !messageInput.value.trim() && attachments.length === 0;
    };
    item.appendChild(removeBtn);
    attachmentPreview.appendChild(item);
  });
}

function renderChatList() {
  chatList.innerHTML = '';
  const chatIds = Object.keys(chats).sort((a, b) => b - a);
  if (chatIds.length === 0) {
    chatList.innerHTML = '<div class="empty-state">Belum ada riwayat chat</div>';
    return;
  }
  chatIds.forEach(id => {
    const item = document.createElement('div');
    item.className = 'chat-item' + (id === currentChatId ? ' active' : '');
    item.textContent = chats[id].title || 'Chat baru';
    item.onclick = () => loadChat(id);
    chatList.appendChild(item);
  });
}

function newChat() {
  currentChatId = Date.now().toString();
  messages = [];
  chatContainer.innerHTML = '';
  chatContainer.appendChild(welcome);
  currentChatTitle.textContent = 'Chat Baru';
  renderChatList();
}

newChatBtn.addEventListener('click', newChat);

function loadChat(id) {
  currentChatId = id;
  messages = chats[id].messages || [];
  currentChatTitle.textContent = chats[id].title || 'Chat baru';
  chatContainer.innerHTML = '';
  if (welcome.parentNode) welcome.remove();
  messages.forEach(msg => appendMessage(msg.role, msg.content, msg.attachments));
  renderChatList();
  if (window.innerWidth <= 768) sidebar.classList.remove('open');
}

function saveChat() {
  if (!currentChatId) return;
  const firstUserMsg = messages.find(m => m.role === 'user');
  let title = 'Chat baru';
  if (firstUserMsg) {
    if (typeof firstUserMsg.content === 'string') {
      title = firstUserMsg.content.substring(0, 40);
      if (firstUserMsg.content.length > 40) title += '...';
    } else {
      title = 'Chat multimodal';
    }
  }
  chats[currentChatId] = { title: title, messages: messages, updatedAt: Date.now() };
  localStorage.setItem('qwen_chats', JSON.stringify(chats));
  currentChatTitle.textContent = title;
  renderChatList();
}

function formatMessage(text) {
  if (typeof text !== 'string') return text;
  text = text.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    return '<pre><code class="language-' + (lang || 'text') + '">' + escapeHtml(code.trim()) + '</code></pre>';
  });
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  text = text.replace(/\n/g, '<br>');
  return text;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function appendMessage(role, content, attachmentsList) {
  attachmentsList = attachmentsList || [];
  if (welcome.parentNode) welcome.remove();
  const msgDiv = document.createElement('div');
  msgDiv.className = 'message ' + role;
  const avatar = document.createElement('div');
  avatar.className = 'message-avatar';
  avatar.textContent = role === 'user' ? '👤' : '✨';
  const contentDiv = document.createElement('div');
  contentDiv.className = 'message-content';
  const header = document.createElement('div');
  header.className = 'message-header';
  header.textContent = role === 'user' ? 'Anda' : 'Qwen';
  const body = document.createElement('div');
  body.className = 'message-body';
  if (Array.isArray(content)) {
    content.forEach(item => {
      if (item.type === 'text') {
        const textSpan = document.createElement('span');
        textSpan.innerHTML = formatMessage(item.text);
        body.appendChild(textSpan);
      } else if (item.type === 'image_url') {
        const img = document.createElement('img');
        img.className = 'attachment-thumb';
        img.src = item.image_url.url;
        body.appendChild(img);
      }
    });
  } else {
    body.innerHTML = formatMessage(content);
  }
  if (attachmentsList && attachmentsList.length > 0 && role === 'user') {
    const attachmentsDiv = document.createElement('div');
    attachmentsDiv.className = 'message-attachments';
    attachmentsList.forEach(att => {
      if (att.type === 'image') {
        const img = document.createElement('img');
        img.className = 'attachment-thumb';
        img.src = att.preview;
        attachmentsDiv.appendChild(img);
      } else {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-attachment';
        fileItem.textContent = '📄 ' + att.name;
        attachmentsDiv.appendChild(fileItem);
      }
    });
    body.appendChild(attachmentsDiv);
  }
  contentDiv.appendChild(header);
  contentDiv.appendChild(body);
  msgDiv.appendChild(avatar);
  msgDiv.appendChild(contentDiv);
  chatContainer.appendChild(msgDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;
  return msgDiv;
}

function showTyping() {
  const msgDiv = document.createElement('div');
  msgDiv.className = 'message assistant';
  msgDiv.id = 'typingIndicator';
  const avatar = document.createElement('div');
  avatar.className = 'message-avatar';
  avatar.textContent = '✨';
  const contentDiv = document.createElement('div');
  contentDiv.className = 'message-content';
  const header = document.createElement('div');
  header.className = 'message-header';
  header.textContent = 'Qwen';
  const body = document.createElement('div');
  body.className = 'message-body';
  body.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';
  contentDiv.appendChild(header);
  contentDiv.appendChild(body);
  msgDiv.appendChild(avatar);
  msgDiv.appendChild(contentDiv);
  chatContainer.appendChild(msgDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function hideTyping() {
  const typing = document.getElementById('typingIndicator');
  if (typing) typing.remove();
}

chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = messageInput.value.trim();
  if (!text && attachments.length === 0) return;
  
  const filesToSend = [...attachments];
  let contentForHistory;
  const attachmentsMeta = [];
  
  if (filesToSend.length > 0) {
    contentForHistory = [{ type: 'text', text: text }];
    for (const file of filesToSend) {
      if (file.type.startsWith('image/')) {
        const preview = URL.createObjectURL(file);
        attachmentsMeta.push({ type: 'image', name: file.name, preview: preview });
      } else {
        attachmentsMeta.push({ type: 'file', name: file.name });
      }
    }
  } else {
    contentForHistory = text;
  }
  
  messages.push({ role: 'user', content: contentForHistory, attachments: attachmentsMeta });
  appendMessage('user', contentForHistory, attachmentsMeta);
  
  messageInput.value = '';
  messageInput.style.height = 'auto';
  attachments = [];
  renderAttachmentPreview();
  sendBtn.disabled = true;
  
  saveChat();
  showTyping();
  
  try {
    const formData = new FormData();
    formData.append('message', text);
    formData.append('model', modelSelect.value);
    const historyForApi = messages.slice(0, -1).map(msg => ({
      role: msg.role,
      content: msg.content
    }));
    formData.append('history', JSON.stringify(historyForApi));
    filesToSend.forEach(file => {
      formData.append('files', file);
    });
    
    const response = await fetch('/api/chat', {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    hideTyping();
    
    if (!response.ok) {
      throw new Error(data.error || 'Gagal mendapatkan respons');
    }
    
    messages.push({ role: 'assistant', content: data.reply });
    appendMessage('assistant', data.reply);
    saveChat();
    
  } catch (error) {
    hideTyping();
    const errorMsg = '❌ Error: ' + error.message;
    messages.push({ role: 'assistant', content: errorMsg });
    appendMessage('assistant', errorMsg);
    console.error(error);
  }
});

document.querySelectorAll('.suggestion-card').forEach(card => {
  card.addEventListener('click', () => {
    messageInput.value = card.dataset.prompt;
    messageInput.dispatchEvent(new Event('input'));
    messageInput.focus();
  });
});

menuBtn.addEventListener('click', () => {
  sidebar.classList.toggle('open');
});

renderChatList();
newChat();
