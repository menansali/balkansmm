
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(private authService: AuthService) {
        super({
            clientID: process.env.GOOGLE_CLIENT_ID || 'mock_id',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'mock_secret',
            callbackURL: 'http://localhost:3001/auth/google/callback',
            scope: ['email', 'profile'],
        });
    }

    async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
        const { name, emails, photos } = profile;

        // Logic: Find or Create user
        const user = await this.authService.validateOAuthUser({
            email: emails[0].value,
            name: name.givenName + ' ' + name.familyName,
            picture: photos[0].value,
            accessToken
        });

        done(null, user);
    }
}
