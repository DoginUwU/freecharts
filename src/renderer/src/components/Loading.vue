<template>
  <div>
    <Airplane1SVG class="loading" />
    <span class="text-sm opacity-75">Carregando...</span>
  </div>
</template>

<script setup lang="ts">
import Airplane1SVG from "./Icons/Airplane1SVG.vue";
</script>

<style scoped>
.loading {
  animation: airplane-loading 10s infinite ease-in-out;
}

@keyframes airplane-loading {
  0% {
    transform: translateY(0) rotate(-5deg) scaleX(-150%) scaleY(150%);
  }
  50% {
    transform: translateY(10px) rotate(5deg) scaleX(-150%) scaleY(150%);
  }
  100% {
    transform: translateY(0) rotate(-5deg) scaleX(-150%) scaleY(150%);
  }
}
</style>
