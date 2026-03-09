<template>
    <textarea v-model="model"
        class="bg-zinc-900/70 outline-none border border-zinc-700/20 rounded-xl px-2 py-1 text-sm focus:border-primary overflow-hidden"
        v-bind="$attrs" spellcheck="false" autocorrect="off" @keydown="handleKeydown" @input="handleInput" />
</template>

<script lang="ts" setup>
const model = defineModel<string>();

const props = defineProps<{
    enterToSubmit?: boolean;
}>();

function handleKeydown(event: KeyboardEvent) {
    if (props.enterToSubmit && event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
    }
}

function handleInput(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    target.style.height = '5px';
    target.style.height = `${target.scrollHeight}px`;
}
</script>
