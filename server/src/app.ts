import express from "express";
import cors from "cors";
import router from "./router/index.js";
import { BASE_URL } from "./config/env.js";

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());
app.use(BASE_URL, router);


export default app;