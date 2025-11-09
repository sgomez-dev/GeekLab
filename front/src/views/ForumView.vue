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
      <button @click="sendMessage" :disabled="sending || !canSend">
        Enviar
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, nextTick } from "vue";
import { getSocket } from "../api/socket";
import api from "../api/axios";
import { useUserStore } from "../stores/userStore";

const userStore = useUserStore();
const socket = getSocket();
const messages = ref([]);
const message = ref("");
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
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

function scrollToBottom() {
  if (!messagesContainer.value) return;
  // wait DOM update
  nextTick(() => {
    const el = messagesContainer.value;
    el.scrollTop = el.scrollHeight;
  });
}

// Handler for new messages
const handleNewMessage = (msg) => {
  console.log("[Forum] New message received:", msg);
  // Avoid duplicates
  if (!messages.value.find((m) => m._id === msg._id)) {
    messages.value.push(msg);
    scrollToBottom();
    dedupeMessages();
  }
};

async function loadMessages() {
  try {
    const res = await api.get("/forum/messages");
    messages.value = res.data;
    scrollToBottom();
    console.log("[Forum] Loaded", messages.value.length, "messages");
  } catch (error) {
    console.error("[Forum] Error loading messages:", error);
  }
}

async function sendMessage() {
  if (!canSend.value || sending.value) return;
  sending.value = true;
  try {
    const content = message.value.trim();
    console.log("[Forum] Sending message:", content);
    // optimistic add
    const tempId = `temp-${Date.now()}`;
    const optimistic = {
      _id: tempId,
      username: userStore.user?.username || "Tú",
      content,
      createdAt: new Date().toISOString(),
    };
    messages.value.push(optimistic);
    scrollToBottom();

    const response = await api.post("/forum/messages", { content });
    console.log("[Forum] Message sent, response:", response.data);

    // replace optimistic with real one
    const idx = messages.value.findIndex((m) => m._id === tempId);
    if (idx !== -1) messages.value[idx] = response.data;
    // ensure no duplicates remain (e.g., if socket broadcast arrived first)
    dedupeMessages();
    message.value = "";
  } catch (e) {
    console.error("Error posting message", e);
    alert(e?.response?.data?.message || "Error publicando el mensaje");
  } finally {
    sending.value = false;
  }
}

function dedupeMessages() {
  const seen = new Set();
  messages.value = messages.value.filter((m) => {
    const id = m && m._id;
    if (!id) return true;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

onMounted(() => {
  console.log("[Forum] Component mounted, loading messages...");
  console.log("[Forum] Socket ID:", socket.id);
  console.log("[Forum] Socket connected:", socket.connected);

  loadMessages();

  // Remove any existing listener to avoid duplicates
  socket.off("forum:new", handleNewMessage);

  // Register the event listener
  socket.on("forum:new", handleNewMessage);
  console.log('[Forum] Event listener registered for "forum:new"');

  // If socket is not connected, try to connect
  if (!socket.connected) {
    console.log("[Forum] Socket not connected, attempting to connect...");
    socket.connect();
  }
});

onBeforeUnmount(() => {
  console.log("[Forum] Component unmounting, cleaning up...");
  // Clean up: remove the event listener when component is destroyed
  socket.off("forum:new", handleNewMessage);
});
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
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
.message-row.own {
  justify-content: flex-end;
}
.message-row.own .bubble {
  background: #4247c1;
  color: #ffffff;
  border-color: #4247c1;
}
.meta {
  display: flex;
  gap: 8px;
  align-items: baseline;
  margin-bottom: 2px;
}
.author {
  font-weight: 600;
  color: #4247c1;
}
.time {
  color: #1c1c29;
  opacity: 0.6;
  font-size: 0.78rem;
}
.content {
  white-space: pre-wrap;
  line-height: 1.4;
  color: #1c1c29;
}
.message-row.own .content {
  color: #ffffff;
}
.message-row.own .author {
  color: #ffffff;
}
.message-row.own .time {
  color: rgba(255, 255, 255, 0.8);
}

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
