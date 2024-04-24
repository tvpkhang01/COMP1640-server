import { Repository } from 'typeorm';
// import { CreateAuthDto } from './dto/create-auth.dto';
// import { UpdateAuthDto } from './dto/update-auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Auth } from './entities/auth.entity';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Auth)
    private readonly authRepository: Repository<Auth>,
    private readonly userService: UserService,
    private jwtService: JwtService,
  ) {}
  async signIn(userName: string, pass: string): Promise<any> {
    const user = await this.userService.findOne(userName);
    if (user?.password !== pass) {
      throw new UnauthorizedException();
    }
    const payload = {
      sub: user.id,
      username: user.userName,
      role: user.role,
      facultyId: user.facultyId,
    };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async validateUserFromToken(token: string): Promise<Auth> {
    try {
      const decodedToken = this.jwtService.verify(token);

      if (!decodedToken || !decodedToken.id) {
        throw new UnauthorizedException('Invalid token');
      }
      const user = await this.authRepository.findOne({
        where: { id: decodedToken.id },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return user;
    } catch (error) {
      // Xử lý lỗi decode token
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid token');
      }
      throw error; // Ném lại lỗi để NestJS xử lý
    }
  }
}
