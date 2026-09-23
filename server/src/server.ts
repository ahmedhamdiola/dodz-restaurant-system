import "dotenv/config";
import { pool } from "./config/database.js";

import app from "./app.js";

const validateEnv = (): void => {
    const secret = process.env.JWT_SECRET ?? "";
    if (secret.length < 32) {
        throw new Error("JWT_SECRET must be set to a value of at least 32 characters in server/.env");
    }
    const expiresIn = process.env.JWT_EXPIRES_IN ?? "7d";
    if (!/^\d+[smhdw]$/.test(expiresIn)) {
        throw new Error('JWT_EXPIRES_IN must be a JWT duration such as "7d", "1h", or "15m" in server/.env');
    }
};

const startServer = async () => {
    try {
        validateEnv();
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