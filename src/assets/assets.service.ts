import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { parseInclude } from 'src/common/utils/parseInclude';
import { parseFilter } from 'src/common/utils/parseFilter';

@Injectable()
export class AssetsService {
  constructor(private prisma: PrismaService) {}

  async create(createAssetDto: CreateAssetDto) {
    const { internalCode } = createAssetDto;
    const existingAsset = await this.prisma.asset.findFirst({
      where: { internalCode, deletedAt: null },
    });

    if (existingAsset) {
      throw new BadRequestException(
        `Asset with internal code ${internalCode} already exists`,
      );
    }

    const asset = await this.prisma.asset.create({
      data: createAssetDto,
    });

    return {
      message: 'Asset created successfully',
      asset,
    };
  }

  async findAll(includeParam?: string | string[], filter?: string | string[]) {
    const include = parseInclude(includeParam);
    const filterWhere = parseFilter(filter);
    const assets = await this.prisma.asset.findMany({
      where: { deletedAt: null, ...filterWhere },
      include,
      orderBy: { internalCode: 'asc' },
    });

    return {
      message: 'Assets fetched successfully',
      assets,
    };
  }

  async findOne(id: string, includeParam?: string | string[]) {
    const include = parseInclude(includeParam);
    const asset = await this.prisma.asset.findFirst({
      where: { id, deletedAt: null },
      include,
    });

    if (!asset) {
      throw new NotFoundException(`Asset with id ${id} not found`);
    }

    return {
      message: 'Asset fetched successfully',
      asset,
    };
  }

  async update(id: string, updateAssetDto: UpdateAssetDto) {
    const asset = await this.prisma.asset.findFirst({
      where: { id, deletedAt: null },
    });

    if (!asset) {
      throw new NotFoundException(`Asset with id ${id} not found`);
    }

    const { internalCode } = updateAssetDto;
    if (internalCode !== asset.internalCode) {
      const existingAsset = await this.prisma.asset.findFirst({
        where: { internalCode, deletedAt: null },
      });
      if (existingAsset) {
        throw new BadRequestException(
          `Asset with internalCode ${internalCode} already exists`,
        );
      }
    }

    const updatedAsset = await this.prisma.asset.update({
      where: { id },
      data: updateAssetDto,
    });

    return {
      message: 'Asset updated successfully',
      asset: updatedAsset,
    };
  }

  async remove(id: string) {
    const asset = await this.prisma.asset.findFirst({
      where: { id, deletedAt: null },
    });

    if (!asset) {
      throw new NotFoundException(`Asset with id ${id} not found`);
    }

    await this.prisma.asset.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return {
      message: 'Asset deleted successfully',
    };
  }

  //   async handover(assetId: string, userId: string) {
  //     const asset = await this.prisma.asset.findFirst({
  //       where: { id: assetId, deletedAt: null },
  //       include: {
  //         deviceModel: true,
  //         deviceType: true,
  //       },
  //     });

  //     if (!asset) {
  //       throw new NotFoundException(`Asset with id ${assetId} not found`);
  //     }

  //     const user = await this.prisma.user.findFirst({
  //       where: { id: userId, deletedAt: null },
  //     });

  //     if (!user) {
  //       throw new NotFoundException(`User with id ${userId} not found`);
  //     }

  //     const templatePath = path.join(
  //       process.cwd(),
  //       'public',
  //       'templates',
  //       'handover-template.html',
  //     );
  //     if (!fs.existsSync(templatePath)) {
  //       throw new BadRequestException(
  //         `HTML template not found at ${templatePath}`,
  //       );
  //     }

  //     let html = fs.readFileSync(templatePath, 'utf-8');

  //     const logoPath = path.join(
  //       process.cwd(),
  //       'public',
  //       'logo',
  //       `${asset.office?.shortName}.png`,
  //     );
  //     const logoBase64 = fs.readFileSync(logoPath).toString('base64');
  //     const logoDataUrl = `data:image/png;base64,${logoBase64}`;

  //     // Điền dữ liệu vào template
  //     html = html
  //       .replace(/{{date}}/g, new Date().toLocaleDateString('vi-VN'))
  //       .replace(/{{sender}}/g, user.name ?? '')
  //       .replace(/{{receiver}}/g, asset.user?.name ?? '')
  //       .replace(/{{department}}/g, asset.department?.name ?? '')
  //       .replace(/{{office}}/g, asset.office?.name ?? '')
  //       .replace(/{{logo}}/g, logoDataUrl)
  //       .replace(/{{assetName}}/g, asset.deviceModel?.name ?? '')
  //       .replace(/{{serialNumber}}/g, asset.serialNumber ?? '');

  //     // Tạo thư mục tmp nếu chưa có
  //     const tmpDir = path.join(process.cwd(), '/public/tmp');
  //     if (!fs.existsSync(tmpDir)) {
  //       fs.mkdirSync(tmpDir, { recursive: true });
  //     }

  //     const fileName = `handover-${user.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${Date.now()}.pdf`;
  //     const outputPath = path.join(tmpDir, fileName);

  //     // Render PDF bằng Puppeteer
  //     const browser = await puppeteer.launch();
  //     const page = await browser.newPage();
  //     await page.setContent(html);
  //     await page.pdf({ path: outputPath, format: 'A4' });
  //     await browser.close();

  //     return {
  //       message: 'PDF file generated',
  //       downloadUrl: `/public/tmp/${fileName}`,
  //     };
  //   }
}
