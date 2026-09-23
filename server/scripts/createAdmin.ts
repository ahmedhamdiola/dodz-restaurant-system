import "dotenv/config";
import bcrypt from "bcryptjs";
import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const main = async () => {
    const name = (process.env.ADMIN_NAME ?? "DODZ Admin").trim();
    const email = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD ?? "";

    if (!EMAIL_REGEX.test(email) || password.length < 8) {
        console.error(
            "Set ADMIN_EMAIL (valid email) and ADMIN_PASSWORD (8+ chars) in server/.env, then run npm run create:admin"
        );
        process.exit(1);
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await pool.query(
        `INSERT INTO users (name, email, phone, password_hash, provider, role, is_email_verified, is_active)
         VALUES ($1, $2, NULL, $3, 'email', 'admin', true, true)
         ON CONFLICT (email) DO UPDATE
            SET role = 'admin', password_hash = EXCLUDED.password_hash, is_active = true
         RETURNING id, name, email, role`,
        [name, email, passwordHash]
    );

    console.log("Admin ready:", result.rows[0]);
    await pool.end();
};

main().catch((error) => {
    console.error(error);
    process.exit(1);
});