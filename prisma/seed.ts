import {
  PrismaClient,
  TransactionRole,
  TransactionStatus,
  TransactionType,
  Warranty,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';
import {
  offices,
  departments,
  users,
  deviceTypes,
  deviceModels,
  ACBHs,
  ACHLs,
  ACLTs,
  ATLTs,
  AITAMs,
  assets,
} from './data';
import { NotFoundException } from '@nestjs/common';

const prisma = new PrismaClient();

async function seedOffices(): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  try {
    // await prisma.$executeRaw`TRUNCATE TABLE "Office" RESTART IDENTITY CASCADE`;
    // console.log('✅ Cleared existing Office and reset IDs');

    for (let i = 0; i < offices.length; i++) {
      const office = offices[i];

      const created = await prisma.office.upsert({
        where: { taxCode: office.taxCode },
        update: { ...office },
        create: { ...office },
      });
      console.log(`Seeded office ${i + 1}/${offices.length}: ${office.name}`);
      map.set(office.shortName, created.id);
    }

    console.log('Office seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding offices:', error);
  }
  return map;
}

async function seedDepartments(): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  try {
    // await prisma.$executeRaw`TRUNCATE TABLE "Department" RESTART IDENTITY CASCADE`;
    // console.log('✅ Cleared existing departments and reset IDs');

    for (let i = 0; i < departments.length; i++) {
      const department = departments[i];

      const created = await prisma.department.upsert({
        where: { name: department.name },
        update: { ...department },
        create: { ...department },
      });
      console.log(
        `Seeded department ${i + 1}/${departments.length}: ${department.name}`,
      );
      map.set(department.name, created.id);
    }

    console.log('✅ Department seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding departments:', error);
  }

  return map;
}

async function seedUser(
  officeMap: Map<string, string>,
  departmentMap: Map<string, string>,
) {
  const map = new Map<string, string>();
  try {
    // await prisma.$executeRaw`TRUNCATE TABLE "User" RESTART IDENTITY CASCADE`;
    // console.log('✅ Cleared existing users and reset IDs');

    const passwordHash = await bcrypt.hash('Amata@123', 10);

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const officeId = officeMap.get(user.officeShortName);
      const departmentId = departmentMap.get(user.departmentName);

      const created = await prisma.user.upsert({
        where: { email: user.email },
        update: {
          name: user.name,
          email: user.email,
          phone: user.phone,
          departmentId,
          officeId,
        },
        create: {
          name: user.name,
          email: user.email,
          phone: user.phone,
          departmentId,
          officeId,
          password: passwordHash,
        },
      });
      console.log(`Seed user ${i + 1}/${users.length}: ${user.name}`);
      map.set(user.name, created.id);
    }
    console.log('✅ User seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding users:', error);
  }
  return map;
}

async function seedDeviceTypes(): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  try {
    // await prisma.$executeRaw`TRUNCATE TABLE "DeviceType" RESTART IDENTITY CASCADE`;
    // console.log('✅ Cleared existing device types and reset IDs');

    for (let i = 0; i < deviceTypes.length; i++) {
      const deviceType = deviceTypes[i];

      const created = await prisma.deviceType.upsert({
        where: { name: deviceType.name },
        update: { ...deviceType },
        create: { ...deviceType },
      });
      console.log(
        `Seeded device type ${i + 1}/${deviceTypes.length}: ${deviceType.name}`,
      );
      map.set(deviceType.name, created.id);
    }

    console.log('✅ Device type seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding device types:', error);
  }
  return map;
}

async function seedDeviceModels(): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  try {
    // await prisma.$executeRaw`TRUNCATE TABLE "DeviceModel" RESTART IDENTITY CASCADE`;
    // console.log('✅ Cleared existing device models and reset IDs');

    for (let i = 0; i < deviceModels.length; i++) {
      const deviceModel = deviceModels[i];

      const created = await prisma.deviceModel.upsert({
        where: { name: deviceModel.name },
        update: { ...deviceModel },
        create: { ...deviceModel },
      });
      console.log(
        `Seeded device model ${i + 1}/${deviceModels.length}: ${deviceModel.name}`,
      );
      map.set(deviceModel.name, created.id);
    }

    console.log('✅ Device model seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding device models:', error);
  }
  return map;
}

async function seedAssets(
  deviceTypeMap: Map<string, string>,
  deviceModelMap: Map<string, string>,
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  // await prisma.$executeRaw`TRUNCATE TABLE "Asset" RESTART IDENTITY CASCADE`;
  // console.log('✅ Cleared existing assets and reset IDs');
  const dataArrays = ACBHs;
  const dataArrays2 = ACHLs;
  const dataArrays3 = ACLTs;
  const dataArrays4 = ATLTs;
  const dataArrays5 = AITAMs;

  try {
    for (let i = 0; i < dataArrays.length; i++) {
      const dataItem = dataArrays[i];

      const deviceTypeId = deviceTypeMap.get(dataItem.device_type.name);
      const deviceModelId = deviceModelMap.get(dataItem.device_model.name);

      let warranty: Warranty = Warranty.ONE;
      if (dataItem.warranty_duration == 'one year') {
        warranty = Warranty.ONE;
      } else if (dataItem.warranty_duration == 'two years') {
        warranty = Warranty.TWO;
      } else if (dataItem.warranty_duration == 'three years') {
        warranty = Warranty.THREE;
      } else if (dataItem.warranty_duration == 'four years') {
        warranty = Warranty.FOUR;
      } else if (dataItem.warranty_duration == 'five years') {
        warranty = Warranty.FIVE;
      } else {
        warranty = Warranty.FIVE;
      }

      const created = await prisma.asset.upsert({
        where: { internalCode: dataItem.code },
        update: {
          internalCode: dataItem.code,
          serialNumber: dataItem.serial_number,
          purchaseDate: new Date(dataItem.purchase_date),
          warranty,
          customProperties: {
            macAddress: dataItem.mac_address,
            cpu: dataItem.cpu,
            ram: dataItem.ram,
            hardDrive: dataItem.hard_drive,
            osType: dataItem.os_type,
          },
          deviceTypeId,
          deviceModelId,
        },
        create: {
          internalCode: dataItem.code,
          serialNumber: dataItem.serial_number,
          purchaseDate: new Date(dataItem.purchase_date),
          warranty,
          customProperties: {
            macAddress: dataItem.mac_address,
            cpu: dataItem.cpu,
            ram: dataItem.ram,
            hardDrive: dataItem.hard_drive,
            osType: dataItem.os_type,
          },
          deviceTypeId,
          deviceModelId,
        },
      });
      console.log(
        `Seeded asset ${i + 1}/${dataArrays.length}: ${dataItem.code}`,
      );
      map.set(dataItem.code, created.id);
    }

    for (let i = 0; i < dataArrays2.length; i++) {
      const dataItem = dataArrays2[i];

      const deviceTypeId = deviceTypeMap.get(dataItem.device_type.name);
      const deviceModelId = deviceModelMap.get(dataItem.device_model.name);

      let warranty: Warranty = Warranty.ONE;
      if (dataItem.warranty_duration == 'one year') {
        warranty = Warranty.ONE;
      } else if (dataItem.warranty_duration == 'two years') {
        warranty = Warranty.TWO;
      } else if (dataItem.warranty_duration == 'three years') {
        warranty = Warranty.THREE;
      } else if (dataItem.warranty_duration == 'four years') {
        warranty = Warranty.FOUR;
      } else if (dataItem.warranty_duration == 'five years') {
        warranty = Warranty.FIVE;
      } else {
        warranty = Warranty.FIVE;
      }

      const created = await prisma.asset.upsert({
        where: { internalCode: dataItem.code },
        update: {
          internalCode: dataItem.code,
          serialNumber: dataItem.serial_number,
          purchaseDate: new Date(dataItem.purchase_date),
          warranty,
          customProperties: {
            macAddress: dataItem.mac_address,
            cpu: dataItem.cpu,
            ram: dataItem.ram,
            hardDrive: dataItem.hard_drive,
            osType: dataItem.os_type,
          },
          deviceTypeId,
          deviceModelId,
        },
        create: {
          internalCode: dataItem.code,
          serialNumber: dataItem.serial_number,
          purchaseDate: new Date(dataItem.purchase_date),
          warranty: Warranty.FIVE,
          customProperties: {
            macAddress: dataItem.mac_address,
            cpu: dataItem.cpu,
            ram: dataItem.ram,
            hardDrive: dataItem.hard_drive,
            osType: dataItem.os_type,
          },
          deviceTypeId,
          deviceModelId,
        },
      });
      console.log(
        `Seeded asset ${i + 1}/${dataArrays2.length}: ${dataItem.code}`,
      );
      map.set(dataItem.code, created.id);
    }

    for (let i = 0; i < dataArrays3.length; i++) {
      const dataItem = dataArrays3[i];

      const deviceTypeId = deviceTypeMap.get(dataItem.device_type.name);
      const deviceModelId = deviceModelMap.get(dataItem.device_model.name);

      let warranty: Warranty = Warranty.ONE;
      if (dataItem.warranty_duration == 'one year') {
        warranty = Warranty.ONE;
      } else if (dataItem.warranty_duration == 'two years') {
        warranty = Warranty.TWO;
      } else if (dataItem.warranty_duration == 'three years') {
        warranty = Warranty.THREE;
      } else if (dataItem.warranty_duration == 'four years') {
        warranty = Warranty.FOUR;
      } else if (dataItem.warranty_duration == 'five years') {
        warranty = Warranty.FIVE;
      } else {
        warranty = Warranty.FIVE;
      }

      const created = await prisma.asset.upsert({
        where: { internalCode: dataItem.code },
        update: {
          internalCode: dataItem.code,
          serialNumber: dataItem.serial_number,
          purchaseDate: new Date(dataItem.purchase_date),
          warranty,
          customProperties: {
            macAddress: dataItem.mac_address,
            cpu: dataItem.cpu,
            ram: dataItem.ram,
            hardDrive: dataItem.hard_drive,
            osType: dataItem.os_type,
          },
          deviceTypeId,
          deviceModelId,
        },
        create: {
          internalCode: dataItem.code,
          serialNumber: dataItem.serial_number,
          purchaseDate: new Date(dataItem.purchase_date),
          warranty: Warranty.FIVE,
          customProperties: {
            macAddress: dataItem.mac_address,
            cpu: dataItem.cpu,
            ram: dataItem.ram,
            hardDrive: dataItem.hard_drive,
            osType: dataItem.os_type,
          },
          deviceTypeId,
          deviceModelId,
        },
      });
      console.log(
        `Seeded asset ${i + 1}/${dataArrays3.length}: ${dataItem.code}`,
      );
      map.set(dataItem.code, created.id);
    }

    for (let i = 0; i < dataArrays4.length; i++) {
      const dataItem = dataArrays4[i];

      const deviceTypeId = deviceTypeMap.get(dataItem.device_type.name);
      const deviceModelId = deviceModelMap.get(dataItem.device_model.name);

      let warranty: Warranty = Warranty.ONE;
      if (dataItem.warranty_duration == 'one year') {
        warranty = Warranty.ONE;
      } else if (dataItem.warranty_duration == 'two years') {
        warranty = Warranty.TWO;
      } else if (dataItem.warranty_duration == 'three years') {
        warranty = Warranty.THREE;
      } else if (dataItem.warranty_duration == 'four years') {
        warranty = Warranty.FOUR;
      } else if (dataItem.warranty_duration == 'five years') {
        warranty = Warranty.FIVE;
      } else {
        warranty = Warranty.FIVE;
      }

      const created = await prisma.asset.upsert({
        where: { internalCode: dataItem.code },
        update: {
          internalCode: dataItem.code,
          serialNumber: dataItem.serial_number,
          purchaseDate: new Date(dataItem.purchase_date),
          warranty,
          customProperties: {
            macAddress: dataItem.mac_address,
            cpu: dataItem.cpu,
            ram: dataItem.ram,
            hardDrive: dataItem.hard_drive,
            osType: dataItem.os_type,
          },
          deviceTypeId,
          deviceModelId,
        },
        create: {
          internalCode: dataItem.code,
          serialNumber: dataItem.serial_number,
          purchaseDate: new Date(dataItem.purchase_date),
          warranty: Warranty.FIVE,
          customProperties: {
            macAddress: dataItem.mac_address,
            cpu: dataItem.cpu,
            ram: dataItem.ram,
            hardDrive: dataItem.hard_drive,
            osType: dataItem.os_type,
          },
          deviceTypeId,
          deviceModelId,
        },
      });
      console.log(
        `Seeded asset ${i + 1}/${dataArrays4.length}: ${dataItem.code}`,
      );
      map.set(dataItem.code, created.id);
    }

    for (let i = 0; i < dataArrays5.length; i++) {
      const dataItem = dataArrays5[i];

      const deviceTypeId = deviceTypeMap.get(dataItem.device_type.name);
      const deviceModelId = deviceModelMap.get(dataItem.device_model.name);

      let warranty: Warranty = Warranty.ONE;
      if (dataItem.warranty_duration == 'one year') {
        warranty = Warranty.ONE;
      } else if (dataItem.warranty_duration == 'two years') {
        warranty = Warranty.TWO;
      } else if (dataItem.warranty_duration == 'three years') {
        warranty = Warranty.THREE;
      } else if (dataItem.warranty_duration == 'four years') {
        warranty = Warranty.FOUR;
      } else if (dataItem.warranty_duration == 'five years') {
        warranty = Warranty.FIVE;
      } else {
        warranty = Warranty.FIVE;
      }

      const created = await prisma.asset.upsert({
        where: { internalCode: dataItem.code },
        update: {
          internalCode: dataItem.code,
          serialNumber: dataItem.serial_number,
          purchaseDate: new Date(dataItem.purchase_date),
          warranty,
          customProperties: {
            macAddress: dataItem.mac_address,
            cpu: dataItem.cpu,
            ram: dataItem.ram,
            hardDrive: dataItem.hard_drive,
            osType: dataItem.os_type,
          },
          deviceTypeId,
          deviceModelId,
        },
        create: {
          internalCode: dataItem.code,
          serialNumber: dataItem.serial_number,
          purchaseDate: new Date(dataItem.purchase_date),
          warranty: Warranty.FIVE,
          customProperties: {
            macAddress: dataItem.mac_address,
            cpu: dataItem.cpu,
            ram: dataItem.ram,
            hardDrive: dataItem.hard_drive,
            osType: dataItem.os_type,
          },
          deviceTypeId,
          deviceModelId,
        },
      });
      console.log(
        `Seeded asset ${i + 1}/${dataArrays5.length}: ${dataItem.code}`,
      );
      map.set(dataItem.code, created.id);
    }

    console.log('✅ Device asset seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding device assets:', error);
  }
  return map;
}

async function seedAssetTransaction() {
  // await prisma.$executeRaw`TRUNCATE TABLE "AssetTransaction" RESTART IDENTITY CASCADE`;
  // console.log('✅ Cleared existing AssetTransaction and reset IDs');
  try {
    for (let i = 0; i < assets.length; i++) {
      const asset = assets[i];

      const getUser = await prisma.user.findFirst({
        where: { email: asset.employee.email, deletedAt: null },
        include: { office: true, department: true },
      });

      if (!getUser) {
        throw new NotFoundException(
          `User with email ${asset.employee.email} not found`,
        );
      }

      const getAsset = await prisma.asset.findFirst({
        where: { internalCode: asset.code, deletedAt: null },
      });

      if (!getAsset) {
        throw new NotFoundException(`Asset with code ${asset.code} not found`);
      }

      let type: TransactionType;
      if (asset.device_status == 'in using') {
        type = TransactionType.TRANSFER;
      } else if (asset.device_status == 'available') {
        type = TransactionType.RETURN;
      } else if (asset.device_status == 'waiting for disposal') {
        type = TransactionType.DISPOSAL;
      } else if (asset.device_status == 'liquidation') {
        type = TransactionType.OTHER;
      } else if (asset.device_status == 'donation') {
        type = TransactionType.DONATION;
      } else {
        type = TransactionType.OTHER;
      }

      await prisma.assetTransaction.create({
        data: {
          assetId: getAsset.id,
          userId: getUser.id,
          departmentId: getUser.departmentId,
          officeId: getUser.officeId,
          role: TransactionRole.TO,
          type,
          status: TransactionStatus.COMPLETED,
        },
      });
      console.log(`Seeded assetTransaction ${i + 1}/${assets.length}`);
    }

    console.log('✅ assetTransaction seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding assetTransaction:', error);
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--office')) {
    await seedOffices();
  } else if (args.includes('--department')) {
    await seedDepartments();
  } else if (args.includes('--user')) {
    const officeMap = await seedOffices();
    const departmentMap = await seedDepartments();
    await seedUser(officeMap, departmentMap);
  } else if (args.includes('--device-type')) {
    await seedDeviceTypes();
  } else if (args.includes('--device-model')) {
    await seedDeviceModels();
  } else if (args.includes('--asset')) {
    const deviceTypeMap = await seedDeviceTypes();
    const deviceModelMap = await seedDeviceModels();
    await seedAssets(deviceTypeMap, deviceModelMap);
  } else if (args.includes('--assetTransaction')) {
    await seedAssetTransaction();
  } else {
    console.log('Please specify a seed type. Available options:');
    console.log('  bun run seed --office');
    console.log('  bun run seed --department');
    console.log('  bun run seed --user');
    console.log('  bun run seed --device-type');
    console.log('  bun run seed --device-model');
    console.log('  bun run seed --asset');
    console.log('  bun run seed --assetTransaction');
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
