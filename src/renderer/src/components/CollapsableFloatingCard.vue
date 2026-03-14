<template>
    <div>
        <div class="bg-zinc-900/90 border-zinc-700 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col"
            :class="expanded ? 'w-80' : 'w-auto'">
            <div class="flex items-center justify-between px-4 py-2.5 border-b border-white/5">
                <div class="flex items-center gap-2" :class="expanded ? '' : 'pr-1'">
                    <component :is="icon" class="w-4 h-4 text-primary" v-if="icon" />
                    <span v-if="expanded" class="text-sm font-semibold text-white tracking-wide">{{ title }}</span>
                </div>
                <button @click="expanded = !expanded"
                    class="text-slate-500 hover:text-white transition p-1 rounded-lg hover:bg-white/5">
                    <PhCaretDown :class="[
                        'w-4 h-4 transition-transform duration-200',
                        expanded ? '' : '-rotate-90',
                    ]" />
                </button>
            </div>

            <template v-if="expanded">
                <slot />
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
import { PhCaretDown } from "@phosphor-icons/vue";
import { ref } from "vue";

defineProps<{
    icon?: any;
    title: string;
}>();

const expanded = ref(false);
</script>
