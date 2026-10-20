import bcrypt from "bcryptjs";

// Pengganti Bun.password agar jalan di Node maupun Bun.
// DB masih kosong (fresh migrate) sehingga format hash bebas dipilih.
const ROUNDS = 10;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, ROUNDS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
