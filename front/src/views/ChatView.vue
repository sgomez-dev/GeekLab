<template>
  <Navbar />
  <div class="chat">
    <h2>Chat GeekLab</h2>
    <div class="messages">
      <div v-for="(msg, i) in messages" :key="i">{{ msg }}</div>
    </div>
    <input
      v-model="message"
      @keyup.enter="sendMessage"
      placeholder="Escribe un mensaje..."
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { io } from "socket.io-client";
import Navbar from "../components/Navbar.vue";

const socket = io("http://localhost:4000");
const messages = ref([]);
const message = ref("");

socket.on("chatMessage", (msg) => {
  messages.value.push(msg);
});

function sendMessage() {
  if (message.value.trim() !== "") {
    socket.emit("chatMessage", message.value);
    message.value = "";
  }
}
</script>

<style scoped>
.chat {
  padding: 1rem;
  color: white;
}
.messages {
  background: #111;
  height: 300px;
  overflow-y: auto;
  padding: 1rem;
  margin-bottom: 1rem;
}
input {
  width: 100%;
  padding: 0.5rem;
  background: #222;
  color: white;
  border: none;
}
</style>
