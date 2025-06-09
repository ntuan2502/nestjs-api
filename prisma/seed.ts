import {
  PrismaClient,
  TransactionDirection,
  TransactionStatus,
  TransactionType,
  UserRole,
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
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ADMIN_ID, DEFAULT_PASSWORD } from 'src/common/const';

const prisma = new PrismaClient();

async function seedAdmin() {
  try {
    const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
    const admin = await prisma.user.findFirst({
      where: { email: 'admin@tun.io.vn' },
    });

    if (admin) throw new BadRequestException(`Admin account already exists`);

    await prisma.user.create({
      data: {
        id: ADMIN_ID,
        name: 'Admin',
        email: 'admin@tun.io.vn',
        password: passwordHash,
        role: UserRole.ADMIN,
        createdById: ADMIN_ID,
      },
    });

    console.log('✅ Admin seeded successfully!');
  } catch (error) {
    console.error('Error seeding admin:', error);
  }
}

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
        create: {
          ...office,
          createdById: ADMIN_ID,
        },
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

async function seedDepartments() {
  try {
    // await prisma.$executeRaw`TRUNCATE TABLE "Department" RESTART IDENTITY CASCADE`;
    // console.log('✅ Cleared existing departments and reset IDs');

    for (let i = 0; i < departments.length; i++) {
      const department = departments[i];

      await prisma.department.upsert({
        where: { name: department.name },
        update: { ...department },
        create: {
          ...department,
          createdById: ADMIN_ID,
        },
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

    const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

    for (let i = 0; i < users.length; i++) {
      const user = users[i];

      const department = await prisma.department.findFirst({
        where: { name: user.departmentName },
      });
      const office = await prisma.office.findFirst({
        where: { shortName: user.officeShortName },
      });

      await prisma.user.upsert({
        where: { email: user.email },
        update: {
          name: user.name,
          email: user.email,
          phone: user.phone,
          departmentId: department?.id,
          officeId: office?.id,
        },
        create: {
          name: user.name,
          email: user.email,
          phone: user.phone,
          departmentId: department?.id,
          officeId: office?.id,
          password: passwordHash,
          createdById: ADMIN_ID,
        },
      });
      console.log(`Seed user ${i + 1}/${users.length}: ${user.name}`);
    }
    console.log('✅ User seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding users:', error);
  }
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
        create: {
          ...deviceType,
          createdById: ADMIN_ID,
        },
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
        create: {
          ...deviceModel,
          createdById: ADMIN_ID,
        },
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

      const data = {
        internalCode: dataItem.code,
        serialNumber: dataItem.serial_number,
        purchaseDate: new Date(dataItem.purchase_date),
        warranty: dataItem.warranty_duration,
        customProperties: {
          macAddress: dataItem.mac_address,
          cpu: dataItem.cpu,
          ram: dataItem.ram,
          hardDrive: dataItem.hard_drive,
          osType: dataItem.os_type,
        },
        deviceTypeId,
        deviceModelId,
      };

      const created = await prisma.asset.upsert({
        where: { internalCode: dataItem.code },
        update: {
          ...data,
        },
        create: {
          ...data,
          createdById: ADMIN_ID,
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

      const data = {
        internalCode: dataItem.code,
        serialNumber: dataItem.serial_number,
        purchaseDate: new Date(dataItem.purchase_date),
        warranty: dataItem.warranty_duration,
        customProperties: {
          macAddress: dataItem.mac_address,
          cpu: dataItem.cpu,
          ram: dataItem.ram,
          hardDrive: dataItem.hard_drive,
          osType: dataItem.os_type,
        },
        deviceTypeId,
        deviceModelId,
      };

      const created = await prisma.asset.upsert({
        where: { internalCode: dataItem.code },
        update: {
          ...data,
        },
        create: {
          ...data,
          createdById: ADMIN_ID,
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

      const data = {
        internalCode: dataItem.code,
        serialNumber: dataItem.serial_number,
        purchaseDate: new Date(dataItem.purchase_date),
        warranty: dataItem.warranty_duration,
        customProperties: {
          macAddress: dataItem.mac_address,
          cpu: dataItem.cpu,
          ram: dataItem.ram,
          hardDrive: dataItem.hard_drive,
          osType: dataItem.os_type,
        },
        deviceTypeId,
        deviceModelId,
      };

      const created = await prisma.asset.upsert({
        where: { internalCode: dataItem.code },
        update: {
          ...data,
        },
        create: {
          ...data,
          createdById: ADMIN_ID,
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

      const data = {
        internalCode: dataItem.code,
        serialNumber: dataItem.serial_number,
        purchaseDate: new Date(dataItem.purchase_date),
        warranty: dataItem.warranty_duration,
        customProperties: {
          macAddress: dataItem.mac_address,
          cpu: dataItem.cpu,
          ram: dataItem.ram,
          hardDrive: dataItem.hard_drive,
          osType: dataItem.os_type,
        },
        deviceTypeId,
        deviceModelId,
      };

      const created = await prisma.asset.upsert({
        where: { internalCode: dataItem.code },
        update: {
          ...data,
        },
        create: {
          ...data,
          createdById: ADMIN_ID,
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

      const data = {
        internalCode: dataItem.code,
        serialNumber: dataItem.serial_number,
        purchaseDate: new Date(dataItem.purchase_date),
        warranty: dataItem.warranty_duration,
        customProperties: {
          macAddress: dataItem.mac_address,
          cpu: dataItem.cpu,
          ram: dataItem.ram,
          hardDrive: dataItem.hard_drive,
          osType: dataItem.os_type,
        },
        deviceTypeId,
        deviceModelId,
      };

      const created = await prisma.asset.upsert({
        where: { internalCode: dataItem.code },
        update: {
          ...data,
        },
        create: {
          ...data,
          createdById: ADMIN_ID,
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

      const batch = await prisma.assetTransferBatch.create({
        data: {
          createdById: ADMIN_ID,
        },
      });

      await prisma.assetTransaction.create({
        data: {
          assetId: getAsset.id,
          userId: getUser.id,
          departmentId: getUser.departmentId,
          officeId: getUser.officeId,
          assetTransferBatchId: batch.id,
          direction: TransactionDirection.INCOMING,
          type,
          status: TransactionStatus.COMPLETED,
          createdById: ADMIN_ID,
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

  if (args.includes('--admin')) {
    await seedAdmin();
  } else if (args.includes('--office')) {
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
    const deviceTypeMap = await seedDeviceTypes();
    const deviceModelMap = await seedDeviceModels();
    await seedAssets(deviceTypeMap, deviceModelMap);
  } else if (args.includes('--assetTransaction')) {
    await seedAssetTransaction();
  } else if (args.includes('--all')) {
    await seedAdmin();
    await seedUser();
    const deviceTypeMap = await seedDeviceTypes();
    const deviceModelMap = await seedDeviceModels();
    await seedAssets(deviceTypeMap, deviceModelMap);
    await seedAssetTransaction();
  } else {
    console.log('Please specify a seed type. Available options:');
    console.log('  bun run seed --admin');
    console.log('  bun run seed --office');
    console.log('  bun run seed --department');
    console.log('  bun run seed --user');
    console.log('  bun run seed --device-type');
    console.log('  bun run seed --device-model');
    console.log('  bun run seed --asset');
    console.log('  bun run seed --assetTransaction');
    console.log('  bun run seed --all');
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
