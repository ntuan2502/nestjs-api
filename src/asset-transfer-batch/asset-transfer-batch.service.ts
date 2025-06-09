import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAssetTransferBatchDto } from './dto/create-asset-transfer-batch.dto';
import { UpdateAssetTransferBatchDto } from './dto/update-asset-transfer-batch.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthRequest } from 'src/common/interfaces/auth-request.interface';
import { Prisma, TransactionStatus, TransactionType } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as puppeteer from 'puppeteer';
import * as dayjs from 'dayjs';
import { normalizePath } from 'src/common/utils/function';
import { ADMIN_ID } from 'src/common/const';

@Injectable()
export class AssetTransferBatchService {
  constructor(private prisma: PrismaService) {}
  private async findActiveOrFail(id: string) {
    const data = await this.prisma.assetTransferBatch.findFirst({
      where: { id, deletedAt: null },
    });

    if (!data) {
      throw new NotFoundException(`assetTransferBatch with id ${id} not found`);
    }

    return data;
  }

  async create(
    req: AuthRequest,
    createAssetTransferBatchDto: CreateAssetTransferBatchDto,
  ) {
    const created = await this.prisma.assetTransferBatch.create({
      data: {
        ...createAssetTransferBatchDto,
        createdById: req.user.sub,
      },
    });

    return {
      message: 'assetTransferBatch created successfully',
      created,
    };
  }

  async findAll(isDeleted: boolean = false) {
    const whereClause = isDeleted ? undefined : { deletedAt: null };

    const assetTransferBatch = await this.prisma.assetTransferBatch.findMany({
      where: whereClause,
      include: {
        createdBy: { select: { id: true, email: true, name: true } },
        updatedBy: { select: { id: true, email: true, name: true } },
        deletedBy: { select: { id: true, email: true, name: true } },
        assetTransactions: {
          where: { status: 'PENDING' },
          include: {
            asset: true,
          },
        },
        handover: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return {
      message: 'assetTransferBatch fetched successfully',
      assetTransferBatch,
    };
  }

  async findOne(id: string, isDeleted: boolean = false) {
    const whereClause: Prisma.AssetTransferBatchWhereInput = { id };

    if (!isDeleted) {
      whereClause.deletedAt = null;
    }
    const assetTransferBatch = await this.prisma.assetTransferBatch.findFirst({
      where: whereClause,
      include: {
        createdBy: { select: { id: true, email: true, name: true } },
        updatedBy: { select: { id: true, email: true, name: true } },
        deletedBy: { select: { id: true, email: true, name: true } },
      },
    });

    if (!assetTransferBatch) {
      throw new NotFoundException(`assetTransferBatch with id ${id} not found`);
    }

    return {
      message: 'assetTransferBatch fetched successfully',
      assetTransferBatch,
    };
  }

  async update(
    req: AuthRequest,
    id: string,
    updateAssetTransferBatchDto: UpdateAssetTransferBatchDto,
  ) {
    await this.findActiveOrFail(id);

    const updated = await this.prisma.assetTransferBatch.update({
      where: { id },
      data: { ...updateAssetTransferBatchDto, updatedById: req.user.sub },
    });
    return {
      message: 'assetTransferBatch updated successfully',
      office: updated,
    };
  }

  async remove(req: AuthRequest, id: string) {
    await this.findActiveOrFail(id);

    await this.prisma.assetTransferBatch.update({
      where: { id },
      data: { deletedAt: new Date(), deletedById: req.user.sub },
    });

    return {
      message: 'assetTransferBatch deleted successfully',
    };
  }

  async getConfirmRequest(assetTransferBatchId: string, type: TransactionType) {
    const assetTransferBatch = await this.prisma.assetTransferBatch.findFirst({
      where: {
        id: assetTransferBatchId,
        deletedAt: null,
      },
      include: {
        assetTransactions: {
          where: {
            status: 'PENDING',
            type,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!assetTransferBatch) {
      throw new NotFoundException(
        `assetTransferBatch with id ${assetTransferBatchId} not found`,
      );
    }

    if (assetTransferBatch.assetTransactions.length === 0) {
      throw new NotFoundException(
        `No pending asset transactions found for assetTransferBatch with id ${assetTransferBatchId}`,
      );
    }

    return {
      message: 'OK',
      assetTransferBatch,
    };
  }

  async confirmRequest(
    assetTransferBatchId: string,
    type: TransactionType,
    signature: Express.Multer.File,
  ) {
    try {
      if (type === TransactionType.TRANSFER) {
        const assetTransferBatchCheck =
          await this.prisma.assetTransferBatch.findFirst({
            where: {
              id: assetTransferBatchId,
              deletedAt: null,
            },
            include: {
              assetTransactions: {
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
                  signature: true,
                },
                orderBy: { createdAt: 'asc' },
              },
            },
          });
        if (!assetTransferBatchCheck) {
          throw new NotFoundException(
            `assetTransferBatch with id ${assetTransferBatchId} not found`,
          );
        }
        const signatureFile = await this.prisma.file.create({
          data: {
            filePath: normalizePath(signature.path),
            createdById: ADMIN_ID,
          },
        });

        for (const assetTransaction of assetTransferBatchCheck.assetTransactions) {
          if (assetTransaction.status !== TransactionStatus.PENDING) continue;

          await this.prisma.assetTransaction.update({
            where: { id: assetTransaction.id },
            data: {
              signatureId: signatureFile.id,
              signedAt: new Date(),
              status: TransactionStatus.COMPLETED,
            },
          });
        }

        const assetTransferBatch =
          await this.prisma.assetTransferBatch.findFirst({
            where: {
              id: assetTransferBatchId,
              deletedAt: null,
            },
            include: {
              assetTransactions: {
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
                  signature: true,
                },
                orderBy: { createdAt: 'asc' },
              },
            },
          });

        if (!assetTransferBatch) {
          throw new NotFoundException(
            `assetTransferBatch with id ${assetTransferBatchId} not found`,
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
          `${assetTransferBatch.assetTransactions[0].office?.shortName}.png`,
        );
        if (!fs.existsSync(logoPath)) {
          throw new NotFoundException(`Logo not found at ${logoPath}`);
        }
        const logoBase64 = fs.readFileSync(logoPath).toString('base64');
        const logoDataUrl = `data:image/png;base64,${logoBase64}`;
        const signFromPath = path.join(
          process.cwd(),
          assetTransferBatch.assetTransactions[0].signature?.filePath || '',
        );
        if (!fs.existsSync(signFromPath)) {
          throw new NotFoundException(`Signature not found at ${signFromPath}`);
        }
        const signFromBase64 = fs.readFileSync(signFromPath).toString('base64');
        const signFromDataUrl = `data:image/png;base64,${signFromBase64}`;
        const signToPath = path.join(
          process.cwd(),
          assetTransferBatch.assetTransactions[1]?.signature?.filePath || '',
        );
        if (!fs.existsSync(signToPath)) {
          throw new NotFoundException(`Signature not found at ${signToPath}`);
        }
        const signToBase64 = fs.readFileSync(signToPath).toString('base64');
        const signToDataUrl = `data:image/png;base64,${signToBase64}`;
        const assetRows = assetTransferBatch.assetTransactions
          .filter((tx) => tx.direction === 'OUTGOING')
          .map((tx, index) => {
            return `
            <tr class="hover:bg-gray-50">
              <td class="px-3 py-1 text-xs text-gray-600 border border-gray-300">${index + 1}</td>
              <td class="px-3 py-1 text-xs text-gray-600 border border-gray-300">${tx.asset?.deviceModel?.name ?? ''}<br>S/N: ${tx.asset?.serialNumber ?? ''}</td>
              <td class="px-3 py-1 text-xs text-gray-600 border border-gray-300">cái</td>
              <td class="px-3 py-1 text-xs text-gray-600 border border-gray-300">1</td>
              <td class="px-3 py-1 text-xs text-gray-600 border border-gray-300">${dayjs(tx.signedAt).format('YYYY-MM-DD')}</td>
              <td class="px-3 py-1 text-xs text-gray-600 border border-gray-300">${tx.user?.name ?? ''}</td>
              <td class="px-3 py-1 text-xs text-gray-600 border border-gray-300">${tx.note ?? ''}</td>
            </tr>
          `;
          })
          .join('');
        html = html
          .replace(
            /{{date}}/g,
            dayjs(assetTransferBatch.assetTransactions[0].signedAt).format(
              'YYYY-MM-DD',
            ) ?? '',
          )
          .replace(
            /{{sender}}/g,
            assetTransferBatch.assetTransactions[0].user?.name ?? '',
          )
          .replace(
            /{{receiver}}/g,
            assetTransferBatch.assetTransactions[1].user?.name ?? '',
          )
          .replace(
            /{{department}}/g,
            assetTransferBatch.assetTransactions[0].department?.name ?? '',
          )
          .replace(
            /{{office}}/g,
            assetTransferBatch.assetTransactions[0].office?.name ?? '',
          )
          .replace(/{{logo}}/g, logoDataUrl)
          .replace(/{{assetRows}}/g, assetRows)
          .replace(
            /{{assetName}}/g,
            assetTransferBatch.assetTransactions[0].asset?.deviceModel?.name ??
              '',
          )
          .replace(
            /{{serialNumber}}/g,
            assetTransferBatch.assetTransactions[0].asset?.serialNumber ?? '',
          )
          .replace(/{{fromSignature}}/g, signFromDataUrl)
          .replace(/{{toSignature}}/g, signToDataUrl)
          .replace(
            /{{senderSignedAt}}/g,
            dayjs(assetTransferBatch.assetTransactions[0].signedAt).format(
              'HH:mm:ss YYYY-MM-DD',
            ) ?? '',
          )
          .replace(
            /{{receiverSignedAt}}/g,
            dayjs(assetTransferBatch.assetTransactions[1].signedAt).format(
              'HH:mm:ss YYYY-MM-DD',
            ) ?? '',
          );
        // Tạo thư mục pdf nếu chưa có
        const pdfDir = path.join(process.cwd(), '/public/pdf');
        if (!fs.existsSync(pdfDir)) {
          fs.mkdirSync(pdfDir, { recursive: true });
        }
        const fileName = `handover_${assetTransferBatch.assetTransactions[1].user?.name?.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${dayjs(assetTransferBatch.assetTransactions[1].signedAt).format('YYYY-MM-DD')}.pdf`;
        const outputPath = path.join(pdfDir, fileName);
        // Render PDF bằng Puppeteer
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent(html);
        await page.pdf({ path: outputPath, format: 'A4' });
        await browser.close();
        const handoverFile = await this.prisma.file.create({
          data: {
            filePath: `/public/pdf/${fileName}`,
            createdById: ADMIN_ID,
          },
        });
        const returnAssetTransaction =
          await this.prisma.assetTransferBatch.update({
            where: { id: assetTransferBatchId },
            data: {
              handoverId: handoverFile.id,
            },
            include: {
              handover: true,
              assetTransactions: {
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
                  signature: true,
                },
              },
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
}
