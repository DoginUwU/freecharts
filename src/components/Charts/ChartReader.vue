<template>
  <aside class="flex flex-1 relative overflow-hidden">
    <div
      class="flex flex-1 w-full h-full items-start justify-start relative bg-zinc-700/30 rounded-tl-lg overflow-auto"
      ref="container"
      @wheel="handleZoom"
    >
      <div
        class="relative canvas-container w-fit h-fit"
        :style="{ transform: `rotate(${state.rotation}deg)` }"
      >
        <canvas ref="canvas" />
        <div ref="textLayer" class="textLayer" />
      </div>
    </div>
    <template v-if="state.loaded && pdf">
      <div
        class="absolute bottom-4 left-4 flex items-center gap-2 max-w-[500px] flex-wrap"
      >
        <button
          v-for="page in Math.min(pdf.numPages, 5)"
          :key="page"
          class="button"
          @click="changePage(page)"
        >
          {{ page }}
        </button>
      </div>
      <div
        class="absolute bottom-4 right-4 flex items-center gap-2 max-w-[500px] flex-wrap"
      >
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

const url =
  "https://www.simbrief.com/ofp/flightplans/SBSVSBCF_PDF_1735929893.pdf";

const canvas = ref<HTMLCanvasElement>();
const textLayer = ref<HTMLDivElement>();
const container = ref<HTMLDivElement>();
let pdf = null as pdfjs.PDFDocumentProxy | null;
let page = null as pdfjs.PDFPageProxy | null;
let textLayerData = null as pdfjs.TextLayer | null;

const state = reactive({
  loaded: false,
  page: 1,
  scale: 1,
  renderInProgress: false,
  rotation: 0,
  keys: {
    control: false,
  },
});

onMounted(async () => {
  pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
  pdf = await pdfjs.getDocument(url).promise;
  state.loaded = true;

  await renderPage();

  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("keyup", handleKeyUp);
});

onBeforeUnmount(() => {
  document.removeEventListener("keydown", handleKeyDown);
  document.removeEventListener("keyup", handleKeyUp);
});

async function renderPage() {
  if (!canvas.value || !textLayer.value || state.renderInProgress || !pdf)
    return;

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

  if (!textLayerData) {
    if (!page || !textLayer.value) return;

    textLayer.value.innerHTML = "";

    const textContent = await page.getTextContent();

    textLayerData = new pdfjs.TextLayer({
      container: textLayer.value,
      textContentSource: textContent,
      viewport,
    });
    await textLayerData.render();
  }

  textLayer.value.style.setProperty("--scale-factor", String(state.scale));

  state.renderInProgress = false;
}

function handleZoom(event: WheelEvent) {
  if (!state.keys.control || !container.value) return;

  event.preventDefault();

  const zoomStep = 0.1;
  const oldScale = state.scale;
  const delta = event.deltaY > 0 ? -zoomStep : zoomStep;
  state.scale = Math.min(Math.max(state.scale + delta, 0.5), 3);

  const rect = container.value.getBoundingClientRect();
  // const childRect = (
  //   container.value.firstChild as HTMLDivElement
  // ).getBoundingClientRect();
  const cursorX = event.clientX - rect.left + container.value.scrollLeft;
  const cursorY = event.clientY - rect.top + container.value.scrollTop;

  const zoomFactor = state.scale / oldScale;

  const newScrollLeft = cursorX * zoomFactor - (event.clientX - rect.left);
  const newScrollTop = cursorY * zoomFactor - (event.clientY - rect.top);

  renderPage();

  container.value.scrollLeft = newScrollLeft;
  container.value.scrollTop = newScrollTop;
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
</script>

<style scoped>
.button {
  @apply bg-zinc-900/90 border border-zinc-700 outline-primary hover:border-primary hover:text-primary w-12 h-12 rounded-lg flex items-center justify-center backdrop-blur-sm;
}
</style>
