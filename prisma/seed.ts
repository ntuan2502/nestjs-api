import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedOffices() {
  try {
    const offices = [
      {
        name: 'CÔNG TY CỔ PHẦN ĐÔ THỊ AMATA BIÊN HÒA',
        internationalName: 'AMATA CITY BIENHOA JOINT STOCK COMPANY',
        shortName: 'ACBH',
        taxCode: '3600265395',
        address:
          'KCN Long Bình (Amata), Phường Long Bình, Thành phố Biên Hoà, Tỉnh Đồng Nai, Việt Nam',
      },
      {
        name: 'CÔNG TY CỔ PHẦN ĐÔ THỊ AMATA HẠ LONG',
        internationalName: 'AMATA CITY HA LONG JOINT STOCK COMPANY',
        shortName: 'ACHL',
        taxCode: '5701929293',
        address:
          'Khu Công nghiệp Sông Khoai, Xã Sông Khoai, Thị xã Quảng Yên, Tỉnh Quảng Ninh, Việt Nam',
      },
      {
        name: 'CÔNG TY CỔ PHẦN ĐÔ THỊ AMATA LONG THÀNH',
        internationalName: 'AMATA CITY LONGTHANH JOINT STOCK COMPANY',
        shortName: 'ACLT',
        taxCode: '3603295006',
        address:
          'Khu Công Nghiệp Công Nghệ Cao Long Thành, Thị Trấn Long Thành, Huyện Long Thành, Tỉnh Đồng Nai, Việt Nam',
      },
      {
        name: 'CÔNG TY TNHH THÀNH PHỐ AMATA LONG THÀNH',
        internationalName: 'AMATA TOWNSHIP LONG THANH COMPANY LIMITED',
        shortName: 'ATLT',
        taxCode: '3603404368',
        address:
          'Trung tâm dịch vụ Amata, Khu thương mại Amata, Phường Long Bình, Thành phố Biên Hoà, Tỉnh Đồng Nai, Việt Nam',
      },
    ];

    for (const office of offices) {
      await prisma.office.create({
        data: office,
      });
      console.log(`Seeded: ${office.name}`);
    }

    console.log('Office seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding offices:', error);
  }
}

async function main() {
  const args = process.argv.slice(2); // Lấy tham số từ dòng lệnh (bỏ qua "bun" và "seed.ts")

  if (args.includes('--office')) {
    await seedOffices();
  } else {
    console.log('Please specify a seed type. Available options:');
    console.log('  bun run seed --office');
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error('Error in seed script:', e);
    process.exit(1);
  })
  .finally(() => {
    prisma
      .$disconnect()
      .catch((e) => console.error('Error during disconnect:', e));
  });
