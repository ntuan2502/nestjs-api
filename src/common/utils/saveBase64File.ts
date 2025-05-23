import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export function saveBase64File(base64String: string, folder: string): string {
  const matches = base64String.match(/^data:(.+);base64,(.+)$/);

  if (!matches) {
    throw new Error('Invalid base64 format');
  }

  const ext = matches[1].split('/')[1];
  const buffer = Buffer.from(matches[2], 'base64');
  const fileName = `${uuidv4()}.${ext}`;
  const filePath = path.join(process.cwd(), '..', '..', 'uploads', folder);

  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(filePath, { recursive: true });
  }

  const fullPath = path.join(filePath, fileName);
  fs.writeFileSync(fullPath, buffer);

  return `/uploads/${folder}/${fileName}`;
}
