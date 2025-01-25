<template>
  <div class="w-full h-full flex items-center justify-center flex-col">
    <h3 class="font-semibold text-xl">Como você deseja prosseguir?</h3>
    <span class="opacity-85 mb-4">
      É sua hora de escolher como devemos prosseguir com seu plano de vôo.
    </span>
    <div class="flex flex-col gap-2">
      <Button>Criar novo plano de vôo</Button>
      <Button>Carregar informações do SimBrief</Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from "../components/Button.vue";
</script>
