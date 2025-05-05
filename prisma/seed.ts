import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import {
  offices,
  departments,
  users,
  deviceTypes,
  deviceModels,
  // ACBHs,
  // ACHLs,
  // ACLTs,
  // ATLTs,
  AITAMs,
} from './data';

const prisma = new PrismaClient();

async function seedOffices() {
  try {
    // await prisma.$executeRaw`TRUNCATE TABLE "Office" RESTART IDENTITY CASCADE`;
    // console.log('✅ Cleared existing Office and reset IDs');

    for (let i = 0; i < offices.length; i++) {
      const office = offices[i];

      await prisma.office.upsert({
        where: { taxCode: office.taxCode },
        update: { ...office },
        create: { ...office },
      });
      console.log(`Seeded office ${i + 1}/${offices.length}: ${office.name}`);
    }

    console.log('Office seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding offices:', error);
  }
}

async function seedDepartments() {
  try {
    // await prisma.$executeRaw`TRUNCATE TABLE "Department" RESTART IDENTITY CASCADE`;
    // console.log('✅ Cleared existing departments and reset IDs');

    for (let i = 0; i < departments.length; i++) {
      const department = departments[i];

      await prisma.department.upsert({
        where: { name: department.name },
        update: { ...department },
        create: { ...department },
      });
      console.log(
        `Seeded department ${i + 1}/${departments.length}: ${department.name}`,
      );
    }

    console.log('✅ Department seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding departments:', error);
  }
}

async function seedUser() {
  try {
    // await prisma.$executeRaw`TRUNCATE TABLE "User" RESTART IDENTITY CASCADE`;
    // console.log('✅ Cleared existing users and reset IDs');

    const passwordHash = await bcrypt.hash('Amata@123', 10);

    for (let i = 0; i < users.length; i++) {
      const user = users[i];

      await prisma.user.upsert({
        where: { email: user.email },
        update: {},
        create: {
          name: user.name,
          email: user.email,
          departmentId: Number(user.department),
          officeId: Number(user.office),
          password: passwordHash,
        },
      });

      console.log(`Seed user ${i + 1}/${users.length}: ${user.name}`);
    }
    console.log('✅ User seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding users:', error);
  }
}

async function seedDeviceTypes() {
  try {
    // await prisma.$executeRaw`TRUNCATE TABLE "DeviceType" RESTART IDENTITY CASCADE`;
    // console.log('✅ Cleared existing device types and reset IDs');

    for (let i = 0; i < deviceTypes.length; i++) {
      const deviceType = deviceTypes[i];

      await prisma.deviceType.upsert({
        where: { name: deviceType.name },
        update: { ...deviceType },
        create: { ...deviceType },
      });
      console.log(
        `Seeded device type ${i + 1}/${deviceTypes.length}: ${deviceType.name}`,
      );
    }

    console.log('✅ Device type seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding device types:', error);
  }
}

async function seedDeviceModels() {
  try {
    // await prisma.$executeRaw`TRUNCATE TABLE "DeviceModel" RESTART IDENTITY CASCADE`;
    // console.log('✅ Cleared existing device models and reset IDs');

    for (let i = 0; i < deviceModels.length; i++) {
      const deviceModel = deviceModels[i];

      await prisma.deviceModel.upsert({
        where: { name: deviceModel.name },
        update: { ...deviceModel },
        create: { ...deviceModel },
      });
      console.log(
        `Seeded device model ${i + 1}/${deviceModels.length}: ${deviceModel.name}`,
      );
    }

    console.log('✅ Device model seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding device models:', error);
  }
}

async function seedAssets() {
  // await prisma.$executeRaw`TRUNCATE TABLE "Asset" RESTART IDENTITY CASCADE`;
  // console.log('✅ Cleared existing assets and reset IDs');
  // const officeId = 2;
  const dataArrays = AITAMs;

  try {
    for (let i = 0; i < dataArrays.length; i++) {
      const dataItem = dataArrays[i];

      const deviceModelId = await prisma.deviceModel.findUnique({
        where: { name: dataItem.device_model.name.trim() },
        select: {
          id: true,
        },
      });
      const deviceTypeId = await prisma.deviceType.findUnique({
        where: { name: dataItem.device_type.name },
        select: {
          id: true,
        },
      });
      const userId = await prisma.user.findUnique({
        where: { email: dataItem.employee.email },
        select: {
          id: true,
        },
      });

      let warrantyDuration = '1';
      if (dataItem.warranty_duration == 'one year') {
        warrantyDuration = '1';
      } else if (dataItem.warranty_duration == 'two years') {
        warrantyDuration = '2';
      } else if (dataItem.warranty_duration == 'three years') {
        warrantyDuration = '3';
      } else if (dataItem.warranty_duration == 'four years') {
        warrantyDuration = '4';
      } else if (dataItem.warranty_duration == 'five years') {
        warrantyDuration = '5';
      } else {
        warrantyDuration = '3';
      }

      await prisma.asset.upsert({
        where: { internalCode: dataItem.code },
        update: {
          internalCode: dataItem.code,
          serialNumber: dataItem.serial_number,
          purchaseDate: new Date(dataItem.purchase_date),
          warrantyDuration,
          status: dataItem.device_status,
          customProperties: {
            macAddress: dataItem.mac_address,
            cpu: dataItem.cpu,
            ram: dataItem.ram,
            hardDrive: dataItem.hard_drive,
            osType: dataItem.os_type,
          },
          deviceModelId: deviceModelId?.id,
          deviceTypeId: deviceTypeId?.id,
          userId: userId?.id,
          // officeId,
        },
        create: {
          internalCode: dataItem.code,
          serialNumber: dataItem.serial_number,
          purchaseDate: new Date(dataItem.purchase_date),
          warrantyDuration,
          status: dataItem.device_status,
          customProperties: {
            macAddress: dataItem.mac_address,
            cpu: dataItem.cpu,
            ram: dataItem.ram,
            hardDrive: dataItem.hard_drive,
            osType: dataItem.os_type,
          },
          deviceModelId: deviceModelId?.id,
          deviceTypeId: deviceTypeId?.id,
          userId: userId?.id,
          // officeId,
        },
      });
      console.log(
        `Seeded asset ${i + 1}/${dataArrays.length}: ${dataItem.code}`,
      );
    }

    console.log('✅ Device asset seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding device assets:', error);
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--office')) {
    await seedOffices();
  } else if (args.includes('--department')) {
    await seedDepartments();
  } else if (args.includes('--user')) {
    await seedUser();
  } else if (args.includes('--device-type')) {
    await seedDeviceTypes();
  } else if (args.includes('--device-model')) {
    await seedDeviceModels();
  } else if (args.includes('--asset')) {
    await seedAssets();
  } else {
    console.log('Please specify a seed type. Available options:');
    console.log('  bun run seed --office');
    console.log('  bun run seed --department');
    console.log('  bun run seed --user');
    console.log('  bun run seed --device-type');
    console.log('  bun run seed --device-model');
    console.log('  bun run seed --asset');
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
