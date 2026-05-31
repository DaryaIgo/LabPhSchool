/**
 * Change admin password script
 *
 * Usage: node scripts/change-admin-password.mjs <new_password>
 */

import { hash } from "bcryptjs";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const newPassword = process.argv[2];
if (!newPassword || newPassword.length < 8) {
  console.error("Usage: node scripts/change-admin-password.mjs <new_password>");
  console.error("Password must be at least 8 characters");
  process.exit(1);
}

async function main() {
  const url = new URL(DATABASE_URL);
  const connection = await mysql.createConnection({
    host: url.hostname,
    port: url.port || 3306,
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1),
  });

  const hashStr = await hash(newPassword, 12);
  const [result] = await connection.execute(
    "UPDATE local_users SET password_hash = ? WHERE login = 'admin'",
    [hashStr]
  );

  if (result.affectedRows === 0) {
    console.error("Admin user 'admin' not found in local_users table");
    process.exit(1);
  }

  console.log("Admin password updated successfully!");
  await connection.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
