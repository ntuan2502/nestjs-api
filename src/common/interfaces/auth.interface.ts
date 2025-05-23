import { Request } from 'express';
import { MicrosoftProfile } from 'src/auth/strategies/microsoft.strategy';

export interface MicrosoftUser {
  id: string;
  displayName: string;
  email: string;
  accessToken: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  name?: string;
}

export interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    displayName: string;
  };
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  microsoftId?: string;
}

export interface MicrosoftRequest extends Request {
  user: {
    accessToken: string;
    profile: MicrosoftProfile;
  };
}
