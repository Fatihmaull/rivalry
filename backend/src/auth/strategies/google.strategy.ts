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

        if (!clientID || !clientSecret || clientID === 'not-configured') {
            console.error('❌ Google OAuth: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is missing!');
            super({
                clientID: clientID || 'missing-client-id',
                clientSecret: clientSecret || 'missing-client-secret',
                callbackURL,
                scope: ['email', 'profile'],
            });
        } else {
            console.log('✅ Google OAuth: Initialized');
            console.log(`- Client ID: ${clientID.substring(0, 10)}...`);
            console.log(`- Callback URL: ${callbackURL}`);
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
