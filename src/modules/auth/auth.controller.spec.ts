import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { Auth } from './entities/auth.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserService } from '../user/user.service';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Auth),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
    authRepository = module.get<Repository<Auth>>(getRepositoryToken(Auth));
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signIn', () => {
    it('should return an access token when sign-in succeeds', async () => {
      const mockAccessToken = 'mocked_access_token';
      jest
        .spyOn(service, 'signIn')
        .mockResolvedValue({ access_token: mockAccessToken });
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue(mockAccessToken);

      const result = await controller.signIn({
        userName: 'testuser',
        password: 'password',
      });

      expect(result).toEqual({ access_token: mockAccessToken });
    });

    it('should throw an error when sign-in fails', async () => {
      jest
        .spyOn(service, 'signIn')
        .mockRejectedValue(new Error('Invalid credentials'));

      await expect(
        controller.signIn({ userName: 'testuser', password: 'wrongpassword' }),
      ).rejects.toThrowError('Invalid credentials');
    });
  });
});
