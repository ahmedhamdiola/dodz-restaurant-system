import express from "express";
import cors from "cors";
import router from "./router/index.js";

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());
app.use(process.env.BASE_URL as string, router);

export default app;