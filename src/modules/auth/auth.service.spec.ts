import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { GenderEnum, RoleEnum } from '../../common/enum/enum';
import { jwtConstants } from './utils/constants';
import { Auth } from './entities/auth.entity';
import { AuthController } from './auth.controller';
import { UserController } from '../user/user.controller';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;
  let jwtService: JwtService;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forFeature([Auth, User]),
        JwtModule.register({
          global: true,
          secret: jwtConstants.secret,
          signOptions: { expiresIn: '2h' },
        }),
      ],
      controllers: [AuthController, UserController],
      providers: [AuthService, UserService, CloudinaryService],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signIn', () => {
    it('should sign in and return access token', async () => {
      const mockUser: User = {
        id: 'efcea8e9-a2ad-494f-a54c-3145e9329db4',
        userName: 'Student 1',
        password: '123456789',
        code: 'GCD202000',
        email: 'thang@gmail.com',
        phone: '0123456789',
        dateOfBirth: undefined,
        avatar: '',
        gender: GenderEnum.MALE,
        role: RoleEnum.ADMIN,
        facultyId: '',
        faculty: undefined,
        contribution: [],
        contributionComment: [],
        createdAt: undefined,
        createdBy: '',
        updatedAt: undefined,
        updatedBy: '',
        deletedAt: undefined,
        deletedBy: '',
      };

      jest.spyOn(userService, 'findOne').mockResolvedValue(mockUser);
      jest
        .spyOn(jwtService, 'signAsync')
        .mockResolvedValue('mocked_access_token');

      const result = await authService.signIn('Student 1', '123456789');

      expect(userService.findOne).toHaveBeenCalledWith('Student 1');
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: 'efcea8e9-a2ad-494f-a54c-3145e9329db4',
        username: 'Student 1',
        role: RoleEnum.ADMIN,
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
        userName: 'Student 1',
        password: '123456789',
        code: 'GCD202000',
        email: 'thang@gmail.com',
        phone: '0123456789',
        dateOfBirth: undefined,
        avatar: '',
        gender: GenderEnum.MALE,
        role: RoleEnum.ADMIN,
        facultyId: '',
        faculty: undefined,
        contribution: [],
        contributionComment: [],
        createdAt: undefined,
        createdBy: '',
        updatedAt: undefined,
        updatedBy: '',
        deletedAt: undefined,
        deletedBy: '',
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
      const decodedToken = { sub: 'efcea8e9-a2ad-494f-a54c-3145e9329db4' };

      jest.spyOn(jwtService, 'verify').mockReturnValue(decodedToken);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue({} as User);

      const result = await authService.validateUserFromToken(token);

      expect(jwtService.verify).toHaveBeenCalledWith(token);
      expect(userRepository.findOne).toHaveBeenCalledWith(
        'efcea8e9-a2ad-494f-a54c-3145e9329db4',
      );
      expect(result).toEqual({});
    });

    it('should throw UnauthorizedException if token is invalid', async () => {
      jest.spyOn(jwtService, 'verify').mockImplementation(() => {
        throw new Error();
      });

      await expect(
        authService.validateUserFromToken('invalid_token'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const token = 'mocked_token';
      const decodedToken = { sub: 'efcea8e9-a2ad-494f-a54c-3145e9329db4' };

      jest.spyOn(jwtService, 'verify').mockReturnValue(decodedToken);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(undefined);

      await expect(authService.validateUserFromToken(token)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
