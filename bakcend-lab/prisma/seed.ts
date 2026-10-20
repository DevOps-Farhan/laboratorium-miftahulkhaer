import "dotenv/config";
import { prisma } from "../lib/prisma";
import { hashPassword } from "../lib/password";

// Seed user default pertama (dijalankan sekali di VPS).
// Idempotent: pakai upsert berdasarkan email unik.
async function main() {
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@smkmiftahulkhaer.my.id";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "Admin12345";

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password: await hashPassword(password),
      name: "Administrator",
      role: "teknisi",
      status: "aktif",
    },
  });

  console.log(`Seed OK: ${user.email} (id=${user.id}, role=${user.role})`);
}

main()
  .catch((e) => {
    console.error("Seed gagal:", e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
