<template>
  <div ref="vantaRef" class="absolute inset-0 z-10"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import * as THREE from "three";
import NET from "vanta/dist/vanta.net.min";

const vantaRef = ref<HTMLElement | null>(null);
let vantaEffect: any = null;

onMounted(() => {
  console.log("VantaBackgroundSimple: Iniciando montaje");

  // Asegurar que THREE esté disponible globalmente
  if (typeof window !== "undefined") {
    (window as any).THREE = THREE;
  }

  if (!vantaRef.value) {
    console.error("VantaBackgroundSimple: vantaRef.value es null");
    return;
  }

  console.log("VantaBackgroundSimple: Elemento encontrado:", vantaRef.value);

  // Usar nextTick para asegurar que el DOM esté completamente renderizado
  setTimeout(() => {
    try {
      vantaEffect = NET({
        el: vantaRef.value,
        THREE: THREE,
        mouseControls: false,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.0,
        minWidth: 200.0,
        scale: 1.0,
        scaleMobile: 1.0,
        color: 0x4247c1,
        backgroundColor: 0xffffff,
        size: 1.5,
        spacing: 25.0,
        maxDistance: 20.0,
        showDots: true,
        showLines: true,
        lineSpeed: 0.1,
        points: 10.0,
        maxConnections: 2,
        connectionRadius: 20.0,
      });

      console.log(
        "VantaBackgroundSimple: Efecto inicializado correctamente",
        vantaEffect
      );
    } catch (e) {
      console.error("Error inicializando Vanta:", e);
    }
  }, 200);
});

onBeforeUnmount(() => {
  if (vantaEffect && typeof vantaEffect.destroy === "function") {
    vantaEffect.destroy();
    vantaEffect = null;
  }
});
</script>

<style scoped>
div {
  width: 100%;
  height: 100%;
  min-height: 100vh;
  min-width: 100vw;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
}
</style>
