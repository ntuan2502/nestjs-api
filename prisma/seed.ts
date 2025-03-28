import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding users...');

  const users: { email: string; password: string; name: string }[] = Array.from(
    { length: 100 },
  ).map(() => ({
    email: faker.internet.email(),
    password: faker.internet.password(),
    name: faker.person.fullName(),
  }));

  await prisma.user.createMany({
    data: users,
    skipDuplicates: true,
  });

  console.log('✅ Seed complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma
      .$disconnect()
      .catch((e) => console.error('Error during disconnect:', e));
  });
