import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Auth } from './entities/auth.entity';
import { GenderEnum, RoleEnum } from '../../common/enum/enum';
import { User } from '../../entities/user.entity';
import { AuthController } from './auth.controller';
import { UserController } from '../user/user.controller';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;
  let jwtService: JwtService;
  let authRepository: Repository<Auth>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      controllers: [AuthController, UserController],
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
        CloudinaryService,
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
    authRepository = module.get<Repository<Auth>>(getRepositoryToken(Auth));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signIn', () => {
    it('should sign in and return access token', async () => {
      const mockUser: User = {
        id: 'efcea8e9-a2ad-494f-a54c-3145e9329db4',
        userName: 'testuser',
        password: 'password',
        code: 'GCD202000',
        email: 'testuser@example.com',
        phone: '0123456789',
        dateOfBirth: new Date(),
        avatar: '',
        gender: GenderEnum.MALE,
        role: RoleEnum.STUDENT,
        facultyId: '',
        faculty: null,
        contribution: [],
        contributionComment: [],
        createdAt: new Date(),
        createdBy: 'admin',
        updatedAt: new Date(),
        updatedBy: 'admin',
        deletedAt: null,
        deletedBy: null,
      };

      jest.spyOn(userService, 'findOne').mockResolvedValue(mockUser);
      jest
        .spyOn(jwtService, 'signAsync')
        .mockResolvedValue('mocked_access_token');

      const result = await authService.signIn('testuser', 'password');

      expect(userService.findOne).toHaveBeenCalledWith('testuser');
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: 'efcea8e9-a2ad-494f-a54c-3145e9329db4',
        username: 'testuser',
        role: RoleEnum.STUDENT,
      });
      expect(result).toEqual({ access_token: 'mocked_access_token' });
    });

    it('should throw UnauthorizedException when user not found', async () => {
      jest.spyOn(userService, 'findOne').mockResolvedValue(undefined);
      await expect(authService.signIn('testuser', 'password')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when password is incorrect', async () => {
      const mockUser: User = {
        id: 'efcea8e9-a2ad-494f-a54c-3145e9329db4',
        userName: 'testuser',
        password: 'password',
        code: 'GCD202000',
        email: 'testuser@example.com',
        phone: '0123456789',
        dateOfBirth: new Date(),
        avatar: '',
        gender: GenderEnum.MALE,
        role: RoleEnum.STUDENT,
        facultyId: '',
        faculty: null,
        contribution: [],
        contributionComment: [],
        createdAt: new Date(),
        createdBy: 'admin',
        updatedAt: new Date(),
        updatedBy: 'admin',
        deletedAt: null,
        deletedBy: null,
      };

      jest.spyOn(userService, 'findOne').mockResolvedValue(mockUser);
      await expect(
        authService.signIn('testuser', 'wrong_password'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateUserFromToken', () => {
    it('should validate user from token', async () => {
      const token = 'mocked_token';
      const decodedToken = { id: 'efcea8e9-a2ad-494f-a54c-3145e9329db4' };

      jest.spyOn(jwtService, 'verify').mockReturnValue(decodedToken);
      jest.spyOn(authRepository, 'findOne').mockResolvedValue({} as Auth);

      const result = await authService.validateUserFromToken(token);

      expect(jwtService.verify).toHaveBeenCalledWith(token);
      expect(authRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'efcea8e9-a2ad-494f-a54c-3145e9329db4' },
      });
      expect(result).toEqual({});
    });

    it('should throw UnauthorizedException if token is invalid', async () => {
      jest.spyOn(jwtService, 'verify').mockImplementation(() => {
        throw new UnauthorizedException();
      });

      await expect(
        authService.validateUserFromToken('invalid_token'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const token = 'mocked_token';
      const decodedToken = { id: '1efcea8e9-a2ad-494f-a54c-3145e9329db4' };

      jest.spyOn(jwtService, 'verify').mockReturnValue(decodedToken);
      jest.spyOn(authRepository, 'findOne').mockResolvedValue(undefined);

      await expect(authService.validateUserFromToken(token)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
