import {
    Controller,
    Post,
    UseInterceptors,
    UploadedFile,
    UseGuards,
    BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';

const UPLOAD_DIR = join(process.cwd(), 'uploads');

const storage = diskStorage({
    destination: UPLOAD_DIR,
    filename: (_req, file, cb) => {
        const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
        cb(null, uniqueName);
    },
});

const fileFilter = (_req: any, file: Express.Multer.File, cb: any) => {
    const allowedMimes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf',
        'video/mp4', 'video/quicktime',
    ];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new BadRequestException(`File type ${file.mimetype} is not allowed`), false);
    }
};

@Controller('upload')
@UseGuards(AuthGuard('jwt'))
export class UploadController {
    @Post()
    @UseInterceptors(FileInterceptor('file', {
        storage,
        fileFilter,
        limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
    }))
    uploadFile(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }

        return {
            filename: file.filename,
            originalName: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            url: `/uploads/${file.filename}`,
        };
    }
}
