// src/auth/strategies/microsoft.strategy.ts
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy } from 'passport-microsoft';
import { Profile } from 'passport';

export interface MicrosoftProfile extends Profile {
  emails?: { value: string }[];
}

@Injectable()
export class MicrosoftStrategy extends PassportStrategy(Strategy, 'microsoft') {
  constructor() {
    super({
      clientID: process.env.MICROSOFT_CLIENT_ID!,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
      callbackURL: process.env.MICROSOFT_REDIRECT_URI!,
      scope: ['user.read'],
      tenant: process.env.MICROSOFT_TENANT_ID!,
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: MicrosoftProfile,
  ): { accessToken: string; profile: MicrosoftProfile } {
    return { accessToken, profile };
  }
}
