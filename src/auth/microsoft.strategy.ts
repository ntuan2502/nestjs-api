// import { Injectable } from '@nestjs/common';
// import { PassportStrategy } from '@nestjs/passport';
// import { Strategy } from 'passport-microsoft';
// import { ConfigService } from '@nestjs/config';
// import { MicrosoftProfile } from './interfaces/microsoft-profile.interface';

// @Injectable()
// export class MicrosoftStrategy extends PassportStrategy(Strategy, 'microsoft') {
//   constructor(private configService: ConfigService) {
//     super({
//       clientID: configService.get<string>('MICROSOFT_CLIENT_ID'),
//       clientSecret: configService.get<string>('MICROSOFT_CLIENT_SECRET'),
//       callbackURL: configService.get<string>('MICROSOFT_REDIRECT_URI'),
//       tenant: configService.get<string>('MICROSOFT_TENANT_ID'),
//       scope: ['openid', 'profile', 'email', 'User.Read'],
//     });
//   }

//   async validate(
//     accessToken: string,
//     refreshToken: string,
//     profile:
//       | { id: string; emails: { value: string }[]; displayName: string }
//       | undefined,
//     done: (err: Error | null, user: MicrosoftProfile | null) => void,
//   ): Promise<void> {
//     let userProfile: MicrosoftProfile;

//     try {
//       if (!profile) {
//         console.log(
//           'Profile not provided by Passport, fetching from Graph API',
//         );
//         const response = await lastValueFrom(
//           this.httpService.get('https://graph.microsoft.com/v1.0/me', {
//             headers: { Authorization: `Bearer ${accessToken}` },
//           }),
//         );
//         const graphData = response.data;
//         console.log('Graph API response:', graphData);

//         if (!graphData.id || !graphData.mail) {
//           throw new Error('Graph API did not return required user data');
//         }

//         userProfile = {
//           microsoftId: graphData.id,
//           email: graphData.mail || graphData.userPrincipalName,
//           name: graphData.displayName || 'Unknown',
//           accessToken,
//         };
//       } else {
//         console.log('Profile from Passport:', profile);
//         userProfile = {
//           microsoftId: profile.id,
//           email: profile.emails[0].value,
//           name: profile.displayName,
//           accessToken,
//         };
//       }

//       done(null, userProfile);
//     } catch (error) {
//       console.error('Error in MicrosoftStrategy:', error.message);
//       done(error instanceof Error ? error : new Error(String(error)), null);
//     }
//   }
// }
