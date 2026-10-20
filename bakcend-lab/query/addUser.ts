import { prisma } from "../lib/prisma";

async function main() {
    const password = "12345678";
    const passwordHash = await Bun.password.hash(password)
    await prisma.user.create({
        data: {
            email: "farhhana075@gmail.com",
            name: "farhan",
            password: passwordHash,
            role: "teknisi",
            status: "aktif"
        }
    })
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });