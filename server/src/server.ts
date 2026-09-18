import "dotenv/config";
import { pool } from "./config/database.js";

import app from "./app.js";

const startServer = async () => {
    try {
        await pool.query("SELECT NOW()");

        console.log("Database connected successfully");

        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        });
    } catch (error) {
        console.error("Database connection failed:", error);
        process.exit(1);
    }
};

startServer();