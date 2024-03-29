import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authService: AuthService,
  ) {
    super({
      clientID: '663430011506-10bg92laar0nopvtd5nn775t9mpo1uvm.apps.googleusercontent.com',
      clientSecret: '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',
      callbackURL: 'http://localhost:3000/api/auth/google/redirect',
      scope: ['profile', 'email'],
    }); 
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    // console.log(accessToken);
    // console.log(refreshToken);
    // console.log(profile);
    const user = await this.authService.validateUser({
      email: profile.emails[0].value,
      displayName: profile.displayName,
    });
    console.log('Validate');
    console.log(user);
    return user || null;
  }
}
