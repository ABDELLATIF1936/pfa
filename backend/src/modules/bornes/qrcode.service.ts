import { Injectable } from '@nestjs/common';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import * as QRCode from 'qrcode';

@Injectable()
export class QrCodeService {
  private readonly outputDirectory = join(
    process.cwd(),
    'uploads',
    'qrcodes',
  );

  async generateQrCode(identifiantUnique: string): Promise<string> {
    await mkdir(this.outputDirectory, { recursive: true });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const scanUrl = `${frontendUrl.replace(/\/$/, '')}/scan?borne=${encodeURIComponent(identifiantUnique)}`;
    const filename = `${randomUUID()}.png`;
    const outputPath = join(this.outputDirectory, filename);

    // Un PNG sur disque est plus léger à servir et à mettre en cache qu'un base64 en base.
    await QRCode.toFile(outputPath, scanUrl, { type: 'png', width: 512 });
    return `/uploads/qrcodes/${filename}`;
  }
}
