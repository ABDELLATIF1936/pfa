import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname, join } from 'node:path';
import { mkdirSync } from 'node:fs';
import { randomUUID } from 'node:crypto';

export const profilePhotosDirectory = join(
  process.cwd(),
  'uploads',
  'profile-photos',
);

mkdirSync(profilePhotosDirectory, { recursive: true });

export const profilePhotoMulterOptions = {
  storage: diskStorage({
    destination: profilePhotosDirectory,
    filename: (_request: unknown, file: Express.Multer.File, callback) => {
      callback(null, `${randomUUID()}${extname(file.originalname).toLowerCase()}`);
    },
  }),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (
    _request: unknown,
    file: Express.Multer.File,
    callback: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    const acceptedMimeTypes = ['image/jpeg', 'image/png'];
    const acceptedExtensions = ['.jpg', '.jpeg', '.png'];
    const extension = extname(file.originalname).toLowerCase();

    // Le MIME et l'extension doivent correspondre; l'extension seule est falsifiable.
    if (
      !acceptedMimeTypes.includes(file.mimetype) ||
      !acceptedExtensions.includes(extension)
    ) {
      return callback(
        new BadRequestException('Seuls les fichiers JPG, JPEG et PNG sont acceptés'),
        false,
      );
    }

    callback(null, true);
  },
};