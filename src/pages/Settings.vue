<template>
    <div class="w-full h-full flex p-6 gap-8 max-w-5xl mx-auto">
        <aside class="w-64 flex flex-col gap-2">
            <nav class="flex flex-col gap-1">
                <button class="flex items-center gap-3 px-4 py-2 rounded-lg bg-primary text-sm font-medium">
                    Arquivos e Diretórios
                </button>
                <!-- <button
                    class="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-zinc-800/50 text-sm opacity-60 transition-all">
                    Simuadores
                </button> -->
            </nav>
        </aside>

        <main class="flex-1 bg-zinc-900/30 border border-zinc-800/50 rounded-2xl p-8">
            <FilesAndDirectorySettings />
        </main>
    </div>
</template>

<script setup lang="ts">
import FilesAndDirectorySettings from '../components/Settings/FilesAndDirectorySettings.vue';
</script>
