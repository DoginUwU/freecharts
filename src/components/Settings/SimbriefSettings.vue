<template>
    <section>
        <header class="mb-8">
            <h3 class="text-lg font-semibold">Simbrief</h3>
            <p class="text-sm opacity-60">
                Defina configurações para sincronização dos planos de voo do Simbrief.
            </p>
        </header>

        <div class="space-y-6">
            <div class="grid gap-4">
                <h4 class="text-sm font-medium border-b border-zinc-800 pb-2">Pilot ID</h4>
                <div class="flex gap-2">
                    <Input v-model="settings.simbriefUserId" label="Identificador de Usuário do Simbrief"
                        placeholder="000000" class="w-full" />
                </div>
                <a href="#" class="opacity-60 hover:underline text-xs" @click.prevent="openSimbrief">
                    Não sabe onde encontrar seu Pilot ID? Clique aqui para acessar a página de configurações
                    de usuário do Simbrief.
                </a>
            </div>
        </div>

        <footer class="mt-6 pt-6 border-t border-zinc-800 flex justify-end gap-3">
            <span class="text-xs opacity-40 self-center mr-auto">As alterações só serão aplicadas após clicar em "Salvar
                Alterações"</span>
            <Button class="bg-primary/20 text-primary hover:bg-primary hover:text-white border border-primary/30"
                @click="saveSettings">
                Salvar Alterações
            </Button>
        </footer>
    </section>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import Button from "../Button.vue";
import Input from "../Input.vue";

const settings = reactive({
    simbriefUserId: "",
});

function openSimbrief() {
    window.api.openExternal("https://dispatch.simbrief.com/account");
}

async function saveSettings() { }
</script>
