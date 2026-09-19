import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool, types } = pg;

// 1700 = NUMERIC in Postgres; pg returns it as a string otherwise
types.setTypeParser(1700, (value) => parseFloat(value));

export const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});