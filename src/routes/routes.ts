import { createMemoryHistory, createRouter } from "vue-router";
import Charts from "../pages/Charts.vue";
import FlightPlan from "../pages/FlightPlan.vue";
import HomePage from "../pages/index.vue";

const routes = [
	{ name: "home", path: "/", component: HomePage },
	{ name: "flight-plan", path: "/flight-plan", component: FlightPlan },
	{ name: "charts", path: "/charts", component: Charts },
];

export const router = createRouter({
	history: createMemoryHistory(),
	routes,
});
