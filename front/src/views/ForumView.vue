<template>
  <div class="wa-forum">
    <div class="messages" ref="messagesContainer">
      <div
        v-for="msg in messages"
        :key="msg._id"
        class="message-row"
        :class="{ own: isOwn(msg) }"
      >
        <div class="bubble">
          <div class="meta">
            <span class="author" v-if="!isOwn(msg)">{{ msg.username }}</span>
            <span class="time">{{ formatTime(msg.createdAt) }}</span>
          </div>
          <div class="content">{{ msg.content }}</div>
        </div>
      </div>
    </div>

    <div class="composer">
      <input
        v-model="message"
        @keyup.enter.exact.prevent="sendMessage"
        placeholder="Escribe un mensaje"
      />
      <button @click="sendMessage" :disabled="sending || !canSend">Enviar</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue';
import { createSocket } from '../api/socket';
import api from '../api/axios';
import { useUserStore } from '../stores/userStore';

const userStore = useUserStore();
const socket = createSocket();
const messages = ref([]);
const message = ref('');
const sending = ref(false);
const messagesContainer = ref(null);

const canSend = computed(() => message.value.trim().length > 0);

function isOwn(msg) {
  const username = userStore.user?.username;
  return !!username && msg?.username === username;
}

function formatTime(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch { return ''; }
}

function scrollToBottom() {
  if (!messagesContainer.value) return;
  // wait DOM update
  nextTick(() => {
    const el = messagesContainer.value;
    el.scrollTop = el.scrollHeight;
  });
}

socket.on('forum:new', (msg) => {
  messages.value.push(msg);
  scrollToBottom();
});

async function loadMessages() {
  const res = await api.get('/forum/messages');
  messages.value = res.data;
  scrollToBottom();
}

async function sendMessage() {
  if (!canSend.value || sending.value) return;
  sending.value = true;
  try {
    const content = message.value.trim();
    await api.post('/forum/messages', { content });
    message.value = '';
    // our own message will arrive via socket broadcast as well
  } catch (e) {
    console.error('Error posting message', e);
    alert(e?.response?.data?.message || 'Error publicando el mensaje');
  } finally {
    sending.value = false;
  }
}

onMounted(loadMessages);
</script>

<style scoped>
.wa-forum {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 70px);
  max-width: 900px;
  margin: 0 auto;
  color: #1c1c29;
  background: #ffffff;
}
.messages {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  background: #f8f9fa;
}
.message-row {
  display: flex;
  margin: 6px 0;
}
.message-row .bubble {
  max-width: 70%;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 8px 10px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}
.message-row.own { justify-content: flex-end; }
.message-row.own .bubble { background: #4247c1; color: #ffffff; border-color: #4247c1; }
.meta { display: flex; gap: 8px; align-items: baseline; margin-bottom: 2px; }
.author { font-weight: 600; color: #4247c1; }
.time { color: #1c1c29; opacity: 0.6; font-size: 0.78rem; }
.content { white-space: pre-wrap; line-height: 1.4; color: #1c1c29; }
.message-row.own .content { color: #ffffff; }
.message-row.own .author { color: #ffffff; }
.message-row.own .time { color: rgba(255,255,255,0.8); }

.composer {
  display: flex;
  gap: 8px;
  padding: 12px;
  border-top: 1px solid #e0e0e0;
  background: #ffffff;
}
.composer input {
  flex: 1;
  background: #f8f9fa;
  color: #1c1c29;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  padding: 10px 14px;
}
.composer button {
  background: var(--primary-color);
  color: #ffffff;
  border: none;
  padding: 10px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}
.composer button:hover {
  background: #3539a0;
}
</style>
