import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { ValidationPipe, Catch, ArgumentsHost, HttpException, HttpStatus, ExceptionFilter } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

@Catch()
class AllExceptionsFilter implements ExceptionFilter {
    constructor(private readonly httpAdapterHost: HttpAdapterHost) { }

    catch(exception: unknown, host: ArgumentsHost): void {
        const { httpAdapter } = this.httpAdapterHost;
        const ctx = host.switchToHttp();

        const httpStatus =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        console.error('🔥 Global Exception Filter caught an error:', exception);

        const responseBody = {
            statusCode: httpStatus,
            timestamp: new Date().toISOString(),
            path: httpAdapter.getRequestUrl(ctx.getRequest()),
            message: (exception as any)?.message || 'Internal server error',
        };

        httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
    }
}

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    const httpAdapterHost = app.get(HttpAdapterHost);
    app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));

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

    // Serve uploaded files as static assets
    app.useStaticAssets(join(process.cwd(), 'uploads'), {
        prefix: '/uploads/',
    });

    // API prefix
    app.setGlobalPrefix('api');

    const port = process.env['PORT'] || 4000;

    // Log active configuration
    console.log('🔧 App Configuration:');
    console.log(`- API URL: https://rivalry-api-8wh1.onrender.com/api`);
    console.log(`- Frontend Origin: ${process.env['CORS_ORIGIN'] || 'http://localhost:3000'}`);
    console.log(`- Database connection configured: ${!!process.env['DATABASE_URL']}`);

    try {
        await app.listen(port, '0.0.0.0');
        console.log(`🚀 Rivalry API running on port ${port}`);
    } catch (err) {
        console.error('❌ Failed to start application:', err);
        process.exit(1);
    }
}
bootstrap();
