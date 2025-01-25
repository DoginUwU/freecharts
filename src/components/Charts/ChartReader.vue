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
          class="relative"
          ref="panContainer"
          :style="{
            transform: `rotate(${state.rotation}deg)`,
            filter: state.invertColors ? 'invert(100%)' : '',
          }"
        >
          <canvas ref="canvas" class="absolute top-0 left-0 w-full h-full" />
          <canvas
            ref="fallbackCanvas"
            class="absolute top-0 left-0 w-full h-full fallback-canvas"
          />
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
      <span
        class="absolute bottom-20 right-4 flex items-center gap-2 max-w-[500px] flex-wrap text-sm text-right touch-none pointer-events-none cursor-none drop-shadow-sm"
      >
        © Decea
        <br />
        Only for flight simulation
      </span>
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
      <div
        class="absolute top-4 left-4 flex items-center gap-2 max-w-[500px] flex-wrap"
      >
        <button class="button" @click="sidebarStore.toggleMinimizeData">
          <CollapseRightSVG v-if="minimizeData" class="text-white" />
          <CollapseLeftSVG v-else class="text-white" />
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
import { Airfield, Chart } from "../../types/airfield";
import Panzoom, { PanzoomObject } from "@panzoom/panzoom";
import CollapseLeftSVG from "../Icons/CollapseLeftSVG.vue";
import { useSidebarStore } from "../../stores/sidebarStore";
import { storeToRefs } from "pinia";
import CollapseRightSVG from "../Icons/CollapseRightSVG.vue";

const canvas = ref<HTMLCanvasElement>();
const fallbackCanvas = ref<HTMLCanvasElement>();
const canvasContainer = ref<HTMLDivElement>();
const panContainer = ref<HTMLDivElement>();
// const textLayer = ref<HTMLDivElement>();
const container = ref<HTMLDivElement>();
let pdf = null as pdfjs.PDFDocumentProxy | null;
let page = null as pdfjs.PDFPageProxy | null;
let panzoom = null as PanzoomObject | null;
// let textLayerData = null as pdfjs.TextLayer | null;

const sidebarStore = useSidebarStore();
const { minimizeData } = storeToRefs(sidebarStore);

const props = defineProps<{
  airfield: Airfield;
  chart: Chart;
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
    props.chart.icao,
    props.chart.id,
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
  if (
    !canvas.value ||
    !fallbackCanvas.value ||
    !panContainer.value ||
    state.renderInProgress ||
    !pdf
  ) {
    return;
  }

  const ratio = window.devicePixelRatio;

  if (!page || page.pageNumber !== state.page) {
    page = await pdf.getPage(state.page);

    const fallbackContext = fallbackCanvas.value.getContext("2d")!;
    const fallbackViewport = page.getViewport({ scale: 1 });
    fallbackCanvas.value.width = fallbackViewport.width * ratio;
    fallbackCanvas.value.height = fallbackViewport.height * ratio;
    await page.render({
      canvasContext: fallbackContext,
      viewport: fallbackViewport,
      annotationMode: 0,
    }).promise;

    panContainer.value.style.width = `${fallbackCanvas.value.width}px`;
    panContainer.value.style.height = `${fallbackCanvas.value.height}px`;
  }

  const context = canvas.value.getContext("2d");

  if (!context) return;

  state.renderInProgress = true;
  fallbackCanvas.value.style.display = "block";

  const viewport = page.getViewport({ scale: state.scale });

  canvas.value.width = viewport.width * ratio;
  canvas.value.height = viewport.height * ratio;
  context.scale(ratio, ratio);

  await page.render({
    canvasContext: context,
    viewport,
    annotationMode: 0,
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

  fallbackCanvas.value.style.display = "none";
  state.renderInProgress = false;
}

function handleZoom(event: WheelEvent) {
  if (!container.value) return;

  event.preventDefault();

  const zoomStep = 0.2;
  const delta = event.deltaY > 0 ? -zoomStep : zoomStep;
  const newScale = Math.min(Math.max(state.scale + delta, 0.5), 5);

  if (newScale === state.scale) return;

  state.scale = newScale;

  const currentPan = panzoom?.getPan();

  if (!currentPan) return;

  panzoom?.zoomWithWheel(event);

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

.fallback-canvas {
  transform-origin: center center;
  /* transition: all 0.3s ease-in-out; */
}
</style>
