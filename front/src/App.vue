<template>
  <div id="app">
    <Navbar />
    <RouterView />
  </div>
</template>

<style>
body {
  margin: 0;
  font-family: "Roboto", "Segoe UI", sans-serif;
  background-color: #0c0c0c;
  color: #fff;
}

#app {
  min-height: 100vh;
}

a {
  color: #0ff;
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
