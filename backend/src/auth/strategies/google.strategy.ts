import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(config: ConfigService) {
        const clientID = config.get<string>('GOOGLE_CLIENT_ID');
        const clientSecret = config.get<string>('GOOGLE_CLIENT_SECRET');
        const callbackURL = config.get<string>('GOOGLE_CALLBACK_URL') || 'http://localhost:4000/api/auth/google/callback';

        if (!clientID || !clientSecret) {
            console.warn('⚠️ Google OAuth is successfully initialized with DUMMY credentials because GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET are missing from .env');
            // If not configured, use dummy values — Google OAuth simply won't work
            super({
                clientID: 'not-configured',
                clientSecret: 'not-configured',
                callbackURL,
                scope: ['email', 'profile'],
            });
        } else {
            super({
                clientID,
                clientSecret,
                callbackURL,
                scope: ['email', 'profile'],
            });
        }
    }

    async validate(
        _accessToken: string,
        _refreshToken: string,
        profile: Profile,
        done: VerifyCallback,
    ): Promise<void> {
        const { emails, displayName, photos } = profile;

        const user = {
            email: emails?.[0]?.value,
            username: displayName,
            avatarUrl: photos?.[0]?.value,
            provider: 'google',
        };

        done(null, user);
    }
}
