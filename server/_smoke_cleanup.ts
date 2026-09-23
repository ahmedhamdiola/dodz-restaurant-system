import { Pool } from "pg";
import { config } from "dotenv";
import * as path from "node:path";
import * as url from "node:url";

config({ path: path.resolve(process.cwd(), ".env") });

const { DATABASE_URL, DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD } = process.env;

const pool = DATABASE_URL
    ? new Pool({ connectionString: DATABASE_URL })
    : new Pool({
          host: DB_HOST ?? "localhost",
          port: Number(DB_PORT ?? 5432),
          database: DB_NAME ?? "dodz_restaurant",
          user: DB_USER,
          password: DB_PASSWORD,
      });

const like = "smoke-%";

async function main() {
    const delItems = await pool.query(
        `DELETE FROM cart_items
          WHERE cart_id IN (
              SELECT id FROM carts WHERE guest_token_hash LIKE $1
          )`,
        [like]
    );
    const delCarts = await pool.query(`DELETE FROM carts WHERE guest_token_hash LIKE $1`, [like]);
    console.log(`cart_items removed: ${delItems.rowCount}`);
    console.log(`carts removed:      ${delCarts.rowCount}`);

    const leftover = await pool.query(
        `SELECT (SELECT count(*) FROM carts WHERE guest_token_hash LIKE $1)::int AS carts,
                (SELECT count(*) FROM orders WHERE idempotency_key LIKE $2)::int AS orders`,
        [like, "smoke-%"]
    );
    console.log(`remaining smoke carts: ${leftover.rows[0].carts}`);
    console.log(`remaining smoke orders: ${leftover.rows[0].orders}`);

    await pool.end();
}

main().catch((e) => {
    console.error(e.message);
    process.exit(1);
});
