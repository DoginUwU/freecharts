<template>
    <section>
        <header class="mb-8">
            <h3 class="text-lg font-semibold">Diretórios de Exportação</h3>
            <p class="text-sm opacity-60">
                Defina onde será salvo os arquivos de cartas e planos de vôo quando
                exportados. Essa opção pode ser útil para uso de visualizadores de PDF dentro do simulador, como
                o AviTab.
            </p>
        </header>

        <div class="space-y-6">
            <div class="grid gap-4">
                <h4 class="text-sm font-medium border-b border-zinc-800 pb-2">Planos de Voo (SimBrief)</h4>
                <div class="flex gap-2">
                    <Input v-model="settings.simbriefPath" label="Caminho de salvamento dos PDFs"
                        placeholder="Ex: C:/Users/Documentos/FlightSim/Plans" class="w-full" />
                    <Button class="self-end mb-0.5" @click="() => selectDirectory('simbrief')">Procurar</Button>
                </div>
            </div>

            <div class="grid gap-4">
                <h4 class="text-sm font-medium border-b border-zinc-800 pb-2">Cartas de Navegação</h4>
                <div class="flex gap-2">
                    <Input v-model="settings.chartsPath" label="Pasta de destino das Cartas"
                        placeholder="Ex: C:/Users/Documentos/FlightSim/Charts" class="w-full" />
                    <Button class="self-end mb-0.5" @click="() => selectDirectory('charts')">Procurar</Button>
                </div>
            </div>

            <div class="grid gap-4 pt-4">
                <h4 class="text-sm font-medium border-b border-zinc-800 pb-2">Organização de Arquivos</h4>
                <div class="flex items-center justify-between bg-zinc-900/40 p-4 rounded-lg border border-zinc-800/50">
                    <div class="flex flex-col gap-0.5">
                        <span class="text-sm font-medium">Limpeza automática de voos anteriores</span>
                        <span class="text-xs opacity-50">
                            Apagar PDFs antigos dos diretórios acima ao iniciar um novo plano de voo.
                        </span>
                    </div>
                    <Toggle v-model="settings.autoDelete" />
                </div>
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
import { onMounted, reactive } from "vue";
import { toast } from "vue-sonner";
import { useSettingsStore } from "../../stores/settingsStore";
import Button from "../Button.vue";
import Input from "../Input.vue";
import Toggle from "../Toggle.vue";

const settingsStore = useSettingsStore();

const settings = reactive({
    simbriefPath: "",
    chartsPath: "",
    autoDelete: false,
});

onMounted(async () => {
    const currentSettings = await settingsStore.currentSettings.filesAndDirectories;
    if (currentSettings) {
        settings.simbriefPath = currentSettings.simbriefPath;
        settings.chartsPath = currentSettings.chartsPath;
        settings.autoDelete = currentSettings.autoDelete;
    }
});

async function saveSettings() {
    await settingsStore.setSetting("filesAndDirectories", {
        simbriefPath: settings.simbriefPath,
        chartsPath: settings.chartsPath,
        autoDelete: settings.autoDelete,
    });

    toast.success("Configurações salvas com sucesso!");
}

async function selectDirectory(type: "simbrief" | "charts") {
    const defaultPath = type === "simbrief" ? settings.simbriefPath : settings.chartsPath;
    const path = await window.api.selectDirectory(defaultPath)

    if (!path) return;

    if (type === "simbrief") {
        settings.simbriefPath = path;
    } else {
        settings.chartsPath = path;
    }
}
</script>
