import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // CORS for frontend
    app.enableCors({
        origin: process.env['CORS_ORIGIN']
            ? process.env['CORS_ORIGIN'].split(',')
            : ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001'],
        credentials: true,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        allowedHeaders: 'Content-Type,Accept,Authorization',
    });

    // Global validation pipe
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
    }));

    // API prefix
    app.setGlobalPrefix('api');

    const port = process.env['PORT'] || 4000;
    await app.listen(port, '0.0.0.0');
    console.log(`🚀 Rivalry API running on port ${port}`);
}
bootstrap();
