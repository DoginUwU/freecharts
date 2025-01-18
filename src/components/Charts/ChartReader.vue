<template>
  <aside class="flex flex-1 relative overflow-hidden">
    <div
      class="flex flex-1 w-full h-full items-start justify-start relative bg-zinc-700/30 rounded-tl-lg overflow-auto"
      ref="container"
      @wheel="handleZoom"
    >
      <div
        class="relative canvas-container w-full h-full flex items-center justify-center"
        ref="canvasContainer"
      >
        <div
          :style="{
            transform: `rotate(${state.rotation}deg)`,
            filter: state.invertColors ? 'invert(100%)' : '',
          }"
        >
          <canvas ref="canvas" />
        </div>
        <!-- <div ref="textLayer" class="textLayer" /> -->
      </div>
    </div>
    <template v-if="state.loaded && pdf">
      <div
        class="absolute bottom-4 left-4 flex items-center gap-2 max-w-[500px] flex-wrap"
      >
        <template v-if="pdf.numPages > 1">
          <button
            v-for="page in Math.min(pdf.numPages, 5)"
            :key="page"
            class="button"
            @click="changePage(page)"
          >
            {{ page }}
          </button>
        </template>
      </div>
      <div
        class="absolute bottom-4 right-4 flex items-center gap-2 max-w-[500px] flex-wrap"
      >
        <button class="button" @click="toggleInvertColors">
          <i v-if="state.invertColors" class="uil uil-sun" />
          <i v-else class="uil uil-moon" />
        </button>
        <button class="button" @click="addRotation(90)">
          <i class="uil uil-corner-left-down" />
        </button>
        <button class="button" @click="addRotation(-90)">
          <i class="uil uil-corner-left-down rotate-90" />
        </button>
      </div>
    </template>
  </aside>
</template>

<script lang="ts" setup>
// @ts-expect-error - typescript doesnt recognizes the build folder
import workerSrc from "pdfjs-dist/build/pdf.worker?worker&url";
import "pdfjs-dist/web/pdf_viewer.css";
import * as pdfjs from "pdfjs-dist";
import { onBeforeUnmount, onMounted, reactive, ref } from "vue";
import { AirfieldService } from "../../services/AirfieldService";
import { Airfield } from "../../types/airfield";
import Panzoom, { PanzoomObject } from "@panzoom/panzoom";

const canvas = ref<HTMLCanvasElement>();
const canvasContainer = ref<HTMLDivElement>();
// const textLayer = ref<HTMLDivElement>();
const container = ref<HTMLDivElement>();
let pdf = null as pdfjs.PDFDocumentProxy | null;
let page = null as pdfjs.PDFPageProxy | null;
let panzoom = null as PanzoomObject | null;
// let textLayerData = null as pdfjs.TextLayer | null;

const props = defineProps<{
  airfield: Airfield;
  chartId: string;
}>();

const state = reactive({
  loaded: false,
  page: 1,
  scale: 1,
  renderInProgress: false,
  rotation: 0,
  invertColors: false,
  test: false,
  keys: {
    control: false,
  },
});

onMounted(async () => {
  pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
  const buffer = await AirfieldService.loadChart(
    props.airfield.icao,
    props.chartId,
  );
  pdf = await pdfjs.getDocument(buffer).promise;
  state.loaded = true;

  await renderPage();

  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("keyup", handleKeyUp);

  if (!canvasContainer.value) return;

  panzoom = Panzoom(canvasContainer.value);
});

onBeforeUnmount(() => {
  document.removeEventListener("keydown", handleKeyDown);
  document.removeEventListener("keyup", handleKeyUp);
});

async function renderPage() {
  if (!canvas.value || state.renderInProgress || !pdf) return;

  if (!page || page.pageNumber !== state.page) {
    page = await pdf.getPage(state.page);
  }

  const context = canvas.value.getContext("2d");

  if (!context) return;

  state.renderInProgress = true;

  const viewport = page.getViewport({ scale: state.scale });

  const ratio = window.devicePixelRatio;

  canvas.value.height = viewport.height * ratio;
  canvas.value.width = viewport.width * ratio;
  context.scale(ratio, ratio);

  await page.render({
    canvasContext: context,
    viewport,
  }).promise;

  // if (!textLayerData) {
  //   if (!page || !textLayer.value) return;

  //   textLayer.value.innerHTML = "";

  //   const textContent = await page.getTextContent();

  //   textLayerData = new pdfjs.TextLayer({
  //     container: textLayer.value,
  //     textContentSource: textContent,
  //     viewport,
  //   });
  //   await textLayerData.render();
  // }

  // textLayer.value.style.setProperty("--scale-factor", String(state.scale));

  state.renderInProgress = false;
}

function handleZoom(event: WheelEvent) {
  if (!container.value) return;

  event.preventDefault();

  const zoomStep = 0.2;
  const delta = event.deltaY > 0 ? -zoomStep : zoomStep;
  state.scale = Math.min(Math.max(state.scale + delta, 0.5), 5);

  const currentPan = panzoom?.getPan();

  if (!currentPan) return;

  // panzoom?.pan(0, 0);

  renderPage();
}

function changePage(page: number) {
  state.page = page;
  renderPage();
}

function addRotation(rotation: number) {
  state.rotation += rotation;

  renderPage();
}

function handleKeyDown(event: KeyboardEvent) {
  switch (event.code) {
    case "ControlLeft":
      state.keys.control = true;
      break;
    case "KeyR":
      if (!event.repeat) {
        addRotation(90);
      }
      break;
  }
}

function handleKeyUp(event: KeyboardEvent) {
  if (event.code === "ControlLeft") {
    state.keys.control = false;
  }
}

function toggleInvertColors() {
  state.invertColors = !state.invertColors;
}
</script>

<style scoped>
.button {
  @apply bg-zinc-900/90 border border-zinc-700 outline-primary hover:border-primary hover:text-primary w-12 h-12 rounded-lg flex items-center justify-center backdrop-blur-sm;
}
</style>
