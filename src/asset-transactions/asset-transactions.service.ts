import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAssetTransactionDto } from './dto/create-asset-transaction.dto';
import { UpdateAssetTransactionDto } from './dto/update-asset-transaction.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { parseInclude } from 'src/common/utils/parseInclude';
import { parseFilter } from 'src/common/utils/parseFilter';
import { normalizePath } from 'src/common/utils/function';
import * as fs from 'fs';
import * as path from 'path';
import * as puppeteer from 'puppeteer';
import {
  TransactionRole,
  TransactionStatus,
  TransactionType,
} from '@prisma/client';
import * as dayjs from 'dayjs';

@Injectable()
export class AssetTransactionsService {
  constructor(private prisma: PrismaService) {}
  async create(createAssetTransactionDto: CreateAssetTransactionDto) {
    const data = { ...createAssetTransactionDto };

    const assetTransaction = await this.prisma.assetTransaction.create({
      data,
    });

    return {
      message: 'Asset transaction created successfully',
      assetTransaction,
    };
  }

  async findAll(includeParam?: string | string[], filter?: string | string[]) {
    const include = parseInclude(includeParam);
    const filterWhere = parseFilter(filter);
    const assetTransactions = await this.prisma.assetTransaction.findMany({
      where: { deletedAt: null, ...filterWhere },
      include,
      orderBy: { createdAt: 'desc' },
    });

    return {
      message: 'Asset transactions fetched successfully',
      assetTransactions,
    };
  }

  async findOne(id: string, includeParam?: string | string[]) {
    const include = parseInclude(includeParam);
    const assetTransaction = await this.prisma.assetTransaction.findFirst({
      where: { id, deletedAt: null },
      include,
    });

    if (!assetTransaction) {
      throw new NotFoundException(`Asset transaction with id ${id} not found`);
    }

    return {
      message: 'Asset transaction fetched successfully',
      assetTransaction,
    };
  }

  async update(
    id: string,
    updateAssetTransactionDto: UpdateAssetTransactionDto,
  ) {
    const assetTransaction = await this.prisma.assetTransaction.findFirst({
      where: { id, deletedAt: null },
    });

    if (!assetTransaction) {
      throw new NotFoundException(`Asset transaction with id ${id} not found`);
    }

    const { ...rest } = updateAssetTransactionDto;

    const updatedAssetTransaction = await this.prisma.assetTransaction.update({
      where: { id },
      data: {
        ...rest,
      },
    });

    return {
      message: 'Asset transaction updated successfully',
      assetTransaction: updatedAssetTransaction,
    };
  }

  async remove(id: string) {
    const assetTransaction = await this.prisma.assetTransaction.findFirst({
      where: { id, deletedAt: null },
    });

    if (!assetTransaction) {
      throw new NotFoundException(`Asset transaction with id ${id} not found`);
    }

    await this.prisma.assetTransaction.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return {
      message: 'Asset transaction deleted successfully',
    };
  }

  async createRequest(
    createAssetTransactionDto: CreateAssetTransactionDto,
    signature?: Express.Multer.File,
  ) {
    const {
      assetId,
      fromUserId,
      toUserId,
      departmentId,
      officeId,
      note,
      type,
    } = createAssetTransactionDto;

    try {
      const asset = await this.prisma.asset.findFirst({
        where: { id: assetId, deletedAt: null },
      });

      if (!asset) {
        throw new NotFoundException(`Asset with id ${assetId} not found`);
      }

      const fromUser = await this.prisma.user.findFirst({
        where: { id: fromUserId, deletedAt: null },
      });

      if (!fromUser) {
        throw new NotFoundException(`User with id ${fromUserId} not found`);
      }

      const toUser = await this.prisma.user.findFirst({
        where: { id: toUserId, deletedAt: null },
      });

      if (!toUser) {
        throw new NotFoundException(`User with id ${toUserId} not found`);
      }

      const department = await this.prisma.department.findFirst({
        where: { id: departmentId, deletedAt: null },
      });

      if (!department) {
        throw new NotFoundException(
          `Department with id ${departmentId} not found`,
        );
      }

      const office = await this.prisma.office.findFirst({
        where: { id: officeId, deletedAt: null },
      });

      if (!office) {
        throw new NotFoundException(`Office with id ${officeId} not found`);
      }

      if (type === TransactionType.TRANSFER) {
        const transaction = await this.prisma.assetTransaction.findFirst({
          where: {
            assetId: asset.id,
            userId: toUser.id,
            departmentId: department.id,
            officeId: office.id,
            role: TransactionRole.TO,
            type: TransactionType.TRANSFER,
            status: TransactionStatus.PENDING,
          },
        });

        if (transaction) {
          throw new BadRequestException(
            `You already have a pending transaction for this asset`,
          );
        }

        const handoverFromTransaction =
          await this.prisma.assetTransaction.findFirst({
            where: {
              assetId: asset.id,
              departmentId: department.id,
              officeId: office.id,
              role: TransactionRole.FROM,
              type: TransactionType.TRANSFER,
              status: TransactionStatus.COMPLETED,
            },
            include: { user: true },
            orderBy: { createdAt: 'desc' },
          });

        const handoverToTransaction =
          await this.prisma.assetTransaction.findFirst({
            where: {
              assetId: asset.id,
              departmentId: department.id,
              officeId: office.id,
              role: TransactionRole.TO,
              type: TransactionType.TRANSFER,
              status: TransactionStatus.COMPLETED,
            },
            include: { user: true },
            orderBy: { createdAt: 'desc' },
          });

        if (handoverFromTransaction && handoverToTransaction) {
          throw new BadRequestException(
            `Asset already handed over from ${handoverFromTransaction.user?.name} to ${handoverToTransaction.user?.name}`,
          );
        }

        const assetTransaction = await this.prisma.assetTransaction.create({
          data: {
            assetId: asset.id,
            userId: fromUser.id,
            departmentId: department.id,
            officeId: office.id,
            note,
            signature: signature ? normalizePath(signature.path) : undefined,
            signedAt: new Date(),
            role: TransactionRole.FROM,
            type: TransactionType.TRANSFER,
            status: TransactionStatus.COMPLETED,
          },
        });

        const confirmedAssetTransaction =
          await this.prisma.assetTransaction.create({
            data: {
              assetId: asset.id,
              userId: toUser.id,
              departmentId: department.id,
              officeId: office.id,
              note,
              role: TransactionRole.TO,
              type: TransactionType.TRANSFER,
              status: TransactionStatus.PENDING,
            },
          });

        return {
          message: 'Asset transaction created successfully',
          assetTransaction,
          confirmedAssetTransaction,
        };
      } else if (type === TransactionType.RETURN) {
        const transaction = await this.prisma.assetTransaction.findFirst({
          where: {
            assetId: asset.id,
            userId: fromUser.id,
            departmentId: department.id,
            officeId: office.id,
            role: TransactionRole.TO,
            type: TransactionType.RETURN,
            status: TransactionStatus.PENDING,
          },
        });

        if (transaction) {
          throw new BadRequestException(
            `You already have a pending transaction for this asset`,
          );
        }

        const handoverFromTransaction =
          await this.prisma.assetTransaction.findFirst({
            where: {
              assetId: asset.id,
              departmentId: department.id,
              officeId: office.id,
              role: TransactionRole.FROM,
              type: TransactionType.RETURN,
              status: TransactionStatus.COMPLETED,
            },
            include: { user: true },
            orderBy: { createdAt: 'desc' },
          });

        const handoverToTransaction =
          await this.prisma.assetTransaction.findFirst({
            where: {
              assetId: asset.id,
              departmentId: department.id,
              officeId: office.id,
              role: TransactionRole.TO,
              type: TransactionType.RETURN,
              status: TransactionStatus.COMPLETED,
            },
            include: { user: true },
            orderBy: { createdAt: 'desc' },
          });

        if (handoverFromTransaction && handoverToTransaction) {
          throw new BadRequestException(
            `Asset already returned from ${handoverFromTransaction.user?.name} to ${handoverToTransaction.user?.name}`,
          );
        }

        const confirmedAssetTransaction =
          await this.prisma.assetTransaction.create({
            data: {
              assetId: asset.id,
              userId: fromUser.id,
              departmentId: department.id,
              officeId: office.id,
              note,
              role: TransactionRole.FROM,
              type: TransactionType.RETURN,
              status: TransactionStatus.PENDING,
            },
          });

        const assetTransaction = await this.prisma.assetTransaction.create({
          data: {
            assetId: asset.id,
            userId: toUser.id,
            departmentId: department.id,
            officeId: office.id,
            note,
            signature: signature ? normalizePath(signature.path) : undefined,
            signedAt: new Date(),
            role: TransactionRole.TO,
            type: TransactionType.RETURN,
            status: TransactionStatus.COMPLETED,
          },
        });

        return {
          message: 'Asset transaction created successfully',
          assetTransaction,
          confirmedAssetTransaction,
        };
      } else {
        throw new BadRequestException('Invalid transaction type');
      }
    } catch (error) {
      if (signature?.path) {
        try {
          fs.unlinkSync(signature.path);
        } catch (unlinkErr) {
          console.warn(
            `Failed to delete temp file: ${signature.path}`,
            unlinkErr,
          );
        }
      }
      throw error;
    }
  }

  async getConfirmRequest(assetId: string, type: TransactionType) {
    const assetTransaction = await this.prisma.assetTransaction.findFirst({
      where: {
        assetId,
        type,
        status: TransactionStatus.PENDING,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!assetTransaction) {
      throw new NotFoundException(
        `requestAssetTransaction with assetId ${assetId} and type ${type} not found`,
      );
    }

    return {
      message: 'OK',
    };
  }

  async confirmRequest(
    assetId: string,
    type: TransactionType,
    signature?: Express.Multer.File,
  ) {
    try {
      if (type === TransactionType.TRANSFER) {
        const assetTransaction = await this.prisma.assetTransaction.findFirst({
          where: {
            assetId,
            role: TransactionRole.TO,
            type: TransactionType.TRANSFER,
            status: TransactionStatus.PENDING,
            deletedAt: null,
          },
          orderBy: { createdAt: 'desc' },
        });

        if (!assetTransaction) {
          throw new NotFoundException(
            `assetTransaction with assetId ${assetId} not found`,
          );
        }

        const confirmedAssetTransaction =
          await this.prisma.assetTransaction.update({
            where: { id: assetTransaction.id },
            data: {
              signature: signature ? normalizePath(signature.path) : undefined,
              signedAt: new Date(),
              status: TransactionStatus.COMPLETED,
            },
            include: {
              asset: {
                include: {
                  deviceModel: true,
                  deviceType: true,
                },
              },
              user: true,
              office: true,
              department: true,
            },
          });

        const requestAssetTransaction =
          await this.prisma.assetTransaction.findFirst({
            where: {
              assetId,
              role: TransactionRole.FROM,
              type: TransactionType.TRANSFER,
              status: TransactionStatus.COMPLETED,
              deletedAt: null,
            },
            include: {
              user: true,
            },
          });

        if (!requestAssetTransaction) {
          throw new NotFoundException(
            `requestAssetTransaction with assetId ${assetId} not found`,
          );
        }

        const templatePath = path.join(
          process.cwd(),
          'public',
          'templates',
          'handover-template.html',
        );
        if (!fs.existsSync(templatePath)) {
          throw new NotFoundException(
            `HTML template not found at ${templatePath}`,
          );
        }

        let html = fs.readFileSync(templatePath, 'utf-8');

        const logoPath = path.join(
          process.cwd(),
          'public',
          'logo',
          `${confirmedAssetTransaction.office?.shortName}.png`,
        );
        if (!fs.existsSync(logoPath)) {
          throw new NotFoundException(`Logo not found at ${logoPath}`);
        }
        const logoBase64 = fs.readFileSync(logoPath).toString('base64');
        const logoDataUrl = `data:image/png;base64,${logoBase64}`;

        const signFromPath = path.join(
          process.cwd(),
          requestAssetTransaction.signature || '',
        );
        if (!fs.existsSync(signFromPath)) {
          throw new NotFoundException(`Signature not found at ${signFromPath}`);
        }
        const signFromBase64 = fs.readFileSync(signFromPath).toString('base64');
        const signFromDataUrl = `data:image/png;base64,${signFromBase64}`;

        const signToPath = path.join(
          process.cwd(),
          confirmedAssetTransaction.signature || '',
        );
        if (!fs.existsSync(signToPath)) {
          throw new NotFoundException(`Signature not found at ${signToPath}`);
        }
        const signToBase64 = fs.readFileSync(signToPath).toString('base64');
        const signToDataUrl = `data:image/png;base64,${signToBase64}`;

        // Điền dữ liệu vào template
        html = html
          .replace(
            /{{date}}/g,
            dayjs(requestAssetTransaction.signedAt).format('YYYY-MM-DD') ?? '',
          )
          .replace(/{{sender}}/g, requestAssetTransaction.user?.name ?? '')
          .replace(/{{receiver}}/g, confirmedAssetTransaction.user?.name ?? '')
          .replace(
            /{{department}}/g,
            confirmedAssetTransaction.department?.name ?? '',
          )
          .replace(/{{office}}/g, confirmedAssetTransaction.office?.name ?? '')
          .replace(/{{logo}}/g, logoDataUrl)
          .replace(/{{note}}/g, requestAssetTransaction.note ?? '')
          .replace(
            /{{assetName}}/g,
            confirmedAssetTransaction.asset?.deviceModel?.name ?? '',
          )
          .replace(
            /{{serialNumber}}/g,
            confirmedAssetTransaction.asset?.serialNumber ?? '',
          )
          .replace(/{{fromSignature}}/g, signFromDataUrl)
          .replace(/{{toSignature}}/g, signToDataUrl)
          .replace(
            /{{senderSignedAt}}/g,
            dayjs(requestAssetTransaction.signedAt).format(
              'HH:mm:ss YYYY-MM-DD',
            ) ?? '',
          )
          .replace(
            /{{receiverSignedAt}}/g,
            dayjs(confirmedAssetTransaction.signedAt).format(
              'HH:mm:ss YYYY-MM-DD',
            ) ?? '',
          );

        // Tạo thư mục pdf nếu chưa có
        const pdfDir = path.join(process.cwd(), '/public/pdf');
        if (!fs.existsSync(pdfDir)) {
          fs.mkdirSync(pdfDir, { recursive: true });
        }

        const fileName = `handover_${confirmedAssetTransaction.user?.name?.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${dayjs(confirmedAssetTransaction.signedAt).format('YYYY-MM-DD')}.pdf`;
        const outputPath = path.join(pdfDir, fileName);

        // Render PDF bằng Puppeteer
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent(html);
        await page.pdf({ path: outputPath, format: 'A4' });
        await browser.close();

        const returnAssetTransaction =
          await this.prisma.assetTransaction.update({
            where: { id: assetTransaction.id },
            data: {
              handoverFilePath: `/public/pdf/${fileName}`,
            },
            include: {
              asset: {
                include: {
                  deviceModel: true,
                  deviceType: true,
                },
              },
              user: true,
              office: true,
              department: true,
            },
          });

        return {
          message: 'Asset transaction confirmed successfully',
          returnAssetTransaction,
        };
      } else if (type === TransactionType.RETURN) {
        const assetTransaction = await this.prisma.assetTransaction.findFirst({
          where: {
            assetId,
            role: TransactionRole.FROM,
            type: TransactionType.RETURN,
            status: TransactionStatus.PENDING,
            deletedAt: null,
          },
          orderBy: { createdAt: 'desc' },
        });

        if (!assetTransaction) {
          throw new NotFoundException(
            `assetTransaction with assetId ${assetId} not found`,
          );
        }

        const confirmedAssetTransaction =
          await this.prisma.assetTransaction.update({
            where: { id: assetTransaction.id },
            data: {
              signature: signature ? normalizePath(signature.path) : undefined,
              signedAt: new Date(),
              status: TransactionStatus.COMPLETED,
            },
            include: {
              asset: {
                include: {
                  deviceModel: true,
                  deviceType: true,
                },
              },
              user: true,
              office: true,
              department: true,
            },
          });

        const requestAssetTransaction =
          await this.prisma.assetTransaction.findFirst({
            where: {
              assetId,
              role: TransactionRole.TO,
              type: TransactionType.RETURN,
              status: TransactionStatus.COMPLETED,
              deletedAt: null,
            },
            include: {
              asset: {
                include: {
                  deviceModel: true,
                  deviceType: true,
                },
              },
              user: true,
              office: true,
              department: true,
            },
          });

        if (!requestAssetTransaction) {
          throw new NotFoundException(
            `requestAssetTransaction with assetId ${assetId} not found`,
          );
        }

        const templatePath = path.join(
          process.cwd(),
          'public',
          'templates',
          'handover-template.html',
        );
        if (!fs.existsSync(templatePath)) {
          throw new NotFoundException(
            `HTML template not found at ${templatePath}`,
          );
        }

        let html = fs.readFileSync(templatePath, 'utf-8');

        const logoPath = path.join(
          process.cwd(),
          'public',
          'logo',
          `${requestAssetTransaction.office?.shortName}.png`,
        );
        if (!fs.existsSync(logoPath)) {
          throw new NotFoundException(`Logo not found at ${logoPath}`);
        }
        const logoBase64 = fs.readFileSync(logoPath).toString('base64');
        const logoDataUrl = `data:image/png;base64,${logoBase64}`;

        const signFromPath = path.join(
          process.cwd(),
          confirmedAssetTransaction.signature || '',
        );
        if (!fs.existsSync(signFromPath)) {
          throw new NotFoundException(`Signature not found at ${signFromPath}`);
        }
        const signFromBase64 = fs.readFileSync(signFromPath).toString('base64');
        const signFromDataUrl = `data:image/png;base64,${signFromBase64}`;

        const signToPath = path.join(
          process.cwd(),
          requestAssetTransaction.signature || '',
        );
        if (!fs.existsSync(signToPath)) {
          throw new NotFoundException(`Signature not found at ${signToPath}`);
        }
        const signToBase64 = fs.readFileSync(signToPath).toString('base64');
        const signToDataUrl = `data:image/png;base64,${signToBase64}`;

        // Điền dữ liệu vào template
        html = html
          .replace(
            /{{date}}/g,
            dayjs(confirmedAssetTransaction.signedAt).format('YYYY-MM-DD') ??
              '',
          )
          .replace(/{{sender}}/g, confirmedAssetTransaction.user?.name ?? '')
          .replace(/{{receiver}}/g, requestAssetTransaction.user?.name ?? '')
          .replace(
            /{{department}}/g,
            requestAssetTransaction.department?.name ?? '',
          )
          .replace(/{{office}}/g, requestAssetTransaction.office?.name ?? '')
          .replace(/{{logo}}/g, logoDataUrl)
          .replace(/{{note}}/g, confirmedAssetTransaction.note ?? '')
          .replace(
            /{{assetName}}/g,
            requestAssetTransaction.asset?.deviceModel?.name ?? '',
          )
          .replace(
            /{{serialNumber}}/g,
            requestAssetTransaction.asset?.serialNumber ?? '',
          )
          .replace(/{{fromSignature}}/g, signFromDataUrl)
          .replace(/{{toSignature}}/g, signToDataUrl)
          .replace(
            /{{senderSignedAt}}/g,
            dayjs(confirmedAssetTransaction.signedAt).format(
              'HH:mm:ss YYYY-MM-DD',
            ) ?? '',
          )
          .replace(
            /{{receiverSignedAt}}/g,
            dayjs(requestAssetTransaction.signedAt).format(
              'HH:mm:ss YYYY-MM-DD',
            ) ?? '',
          );

        // Tạo thư mục pdf nếu chưa có
        const pdfDir = path.join(process.cwd(), '/public/pdf');
        if (!fs.existsSync(pdfDir)) {
          fs.mkdirSync(pdfDir, { recursive: true });
        }

        const fileName = `handover_${requestAssetTransaction.user?.name?.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${dayjs(confirmedAssetTransaction.signedAt).format('YYYY-MM-DD')}.pdf`;
        const outputPath = path.join(pdfDir, fileName);

        // Render PDF bằng Puppeteer
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent(html);
        await page.pdf({ path: outputPath, format: 'A4' });
        await browser.close();

        const returnAssetTransaction =
          await this.prisma.assetTransaction.update({
            where: { id: assetTransaction.id },
            data: {
              handoverFilePath: `/public/pdf/${fileName}`,
            },
            include: {
              asset: {
                include: {
                  deviceModel: true,
                  deviceType: true,
                },
              },
              user: true,
              office: true,
              department: true,
            },
          });

        return {
          message: 'Asset transaction confirmed successfully',
          returnAssetTransaction,
        };
      } else {
        throw new BadRequestException('Invalid transaction type');
      }
    } catch (error) {
      if (signature?.path) {
        try {
          fs.unlinkSync(signature.path);
        } catch (unlinkErr) {
          console.warn(
            `Failed to delete temp file: ${signature.path}`,
            unlinkErr,
          );
        }
      }
      throw error;
    }
  }

  async createHandover(assetId: string) {
    const requestAssetTransaction =
      await this.prisma.assetTransaction.findFirst({
        where: {
          assetId,
          role: TransactionRole.FROM,
          type: TransactionType.TRANSFER,
          status: TransactionStatus.PENDING,
          deletedAt: null,
        },
        include: {
          user: true,
        },
      });

    if (!requestAssetTransaction) {
      throw new NotFoundException(
        `requestAssetTransaction with assetId ${assetId} not found`,
      );
    }

    const confirmAssetTransaction =
      await this.prisma.assetTransaction.findFirst({
        where: {
          assetId,
          role: TransactionRole.TO,
          type: TransactionType.TRANSFER,
          status: TransactionStatus.PENDING,
          deletedAt: null,
        },
        include: {
          asset: {
            include: {
              deviceModel: true,
              deviceType: true,
            },
          },
          user: true,
          office: true,
          department: true,
        },
      });

    if (!confirmAssetTransaction) {
      throw new NotFoundException(
        `confirmAssetTransaction with assetId ${assetId} not found`,
      );
    }

    const templatePath = path.join(
      process.cwd(),
      'public',
      'templates',
      'handover-template.html',
    );
    if (!fs.existsSync(templatePath)) {
      throw new NotFoundException(`HTML template not found at ${templatePath}`);
    }

    let html = fs.readFileSync(templatePath, 'utf-8');

    const logoPath = path.join(
      process.cwd(),
      'public',
      'logo',
      `${confirmAssetTransaction.office?.shortName}.png`,
    );
    if (!fs.existsSync(logoPath)) {
      throw new NotFoundException(`Logo not found at ${logoPath}`);
    }
    const logoBase64 = fs.readFileSync(logoPath).toString('base64');
    const logoDataUrl = `data:image/png;base64,${logoBase64}`;

    const signFromPath = path.join(
      process.cwd(),
      requestAssetTransaction.signature || '',
    );
    if (!fs.existsSync(signFromPath)) {
      throw new NotFoundException(`Signature not found at ${signFromPath}`);
    }
    const signFromBase64 = fs.readFileSync(signFromPath).toString('base64');
    const signFromDataUrl = `data:image/png;base64,${signFromBase64}`;

    const signToPath = path.join(
      process.cwd(),
      confirmAssetTransaction.signature || '',
    );
    if (!fs.existsSync(signToPath)) {
      throw new NotFoundException(`Signature not found at ${signToPath}`);
    }
    const signToBase64 = fs.readFileSync(signToPath).toString('base64');
    const signToDataUrl = `data:image/png;base64,${signToBase64}`;

    // Điền dữ liệu vào template
    html = html
      .replace(/{{date}}/g, new Date().toLocaleDateString('vi-VN'))
      .replace(/{{sender}}/g, requestAssetTransaction.user?.name ?? '')
      .replace(/{{receiver}}/g, confirmAssetTransaction.user?.name ?? '')
      .replace(
        /{{department}}/g,
        confirmAssetTransaction.department?.name ?? '',
      )
      .replace(/{{office}}/g, confirmAssetTransaction.office?.name ?? '')
      .replace(/{{logo}}/g, logoDataUrl)
      .replace(
        /{{assetName}}/g,
        confirmAssetTransaction.asset?.deviceModel?.name ?? '',
      )
      .replace(
        /{{serialNumber}}/g,
        confirmAssetTransaction.asset?.serialNumber ?? '',
      )
      .replace(/{{fromSignature}}/g, signFromDataUrl)
      .replace(/{{toSignature}}/g, signToDataUrl);

    // Tạo thư mục pdf nếu chưa có
    const pdfDir = path.join(process.cwd(), '/public/pdf');
    if (!fs.existsSync(pdfDir)) {
      fs.mkdirSync(pdfDir, { recursive: true });
    }

    const fileName = `handover-${confirmAssetTransaction.user?.name?.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${Date.now()}.pdf`;
    const outputPath = path.join(pdfDir, fileName);

    // Render PDF bằng Puppeteer
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html);
    await page.pdf({ path: outputPath, format: 'A4' });
    await browser.close();

    return {
      message: 'PDF file generated',
      downloadUrl: `/public/pdf/${fileName}`,
    };
  }
}
