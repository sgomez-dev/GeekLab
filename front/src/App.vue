<template>
  <div id="app">
    <Navbar v-if="showNavbar" />
    <div class="main-content" :class="{ 'no-navbar': !showNavbar }">
      <RouterView />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import Navbar from './components/Navbar.vue';

const route = useRoute();

const showNavbar = computed(() => {
  return route.path !== '/login' && route.path !== '/register';
});
</script>

<style>
body {
  margin: 0;
  font-family: "Roboto", "Segoe UI", sans-serif;
  background-color: #ffffff;
  color: #1c1c29;
}

#app {
  min-height: 100vh;
  background-color: #ffffff;
}

.main-content {
  padding-top: 70px;
}

.main-content.no-navbar {
  padding-top: 0;
}

a {
  color: #4247c1;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

button {
  cursor: pointer;
  transition: 0.2s ease;
}

button:hover {
  opacity: 0.9;
}
</style>
