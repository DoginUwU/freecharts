import axios from "axios";
import { config } from "../environment";

const api = axios.create({
	baseURL: config.apiUrl,
	headers: {
		provider: "aisweb",
	},
});

export { api };
