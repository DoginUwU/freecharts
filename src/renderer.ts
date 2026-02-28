// @ts-expect-error - Css imports are not recognized by TypeScript, but they work in the build process
import "./styles/index.css";

import { VueQueryPlugin } from "@tanstack/vue-query";
import { createPinia } from "pinia";
import { createApp } from "vue";
import App from "./App.vue";
import { router } from "./routes/routes";

const pinia = createPinia();

createApp(App).use(VueQueryPlugin).use(pinia).use(router).mount("#app");
