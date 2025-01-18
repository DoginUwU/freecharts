<template>
  <main class="flex h-screen">
    <Sidebar />
    <router-view class="flex-1" />
  </main>
</template>

<script setup lang="ts">
import Sidebar from "./components/Sidebar.vue";
</script>
