<template>
    <div class="w-full h-full flex p-6 gap-8 max-w-5xl mx-auto">
        <aside class="w-64 flex flex-col gap-2">
            <nav class="flex flex-col gap-1">
                <button v-for="option in SIDEBAR_OPTIONS" :key="option.value" @click="handleSidebarOptionClick(option)"
                    :class="[
                        'flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                        selectedOption === option.value
                            ? 'bg-primary'
                            : 'hover:bg-zinc-800/50 opacity-60',
                    ]">
                    {{ option.label }}
                </button>
            </nav>
        </aside>

        <main class="flex-1 bg-zinc-900/30 border border-zinc-800/50 rounded-2xl p-8">
            <FilesAndDirectorySettings v-if="selectedOption === 'files-and-directories'" />
            <SimbriefSettings v-else-if="selectedOption === 'simbrief'" />
        </main>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import FilesAndDirectorySettings from '../components/Settings/FilesAndDirectorySettings.vue';
import SimbriefSettings from '../components/Settings/SimbriefSettings.vue';

const SIDEBAR_OPTIONS = [
    {
        label: 'Arquivos e Diretórios',
        value: 'files-and-directories',
    },
    {
        label: 'Simbrief',
        value: 'simbrief',
    },
] as const;

const selectedOption = ref(SIDEBAR_OPTIONS[0].value as typeof SIDEBAR_OPTIONS[number]['value']);

function handleSidebarOptionClick(option: typeof SIDEBAR_OPTIONS[number]) {
    selectedOption.value = option.value;
}
</script>
