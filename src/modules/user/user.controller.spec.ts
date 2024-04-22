import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { Repository } from 'typeorm';
import { EntityManager } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateUserDto } from './dto/create-user.dto';
import { GenderEnum, RoleEnum } from '../../common/enum/enum';
import { GetUserParams } from './dto/getList_user.dto';
import { ResponsePaginate } from '../../common/dtos/responsePaginate';
import { PageMetaDto } from '../../common/dtos/pageMeta';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: EntityManager,
          useValue: {
            save: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
            verify: jest.fn(),
          },
        },
        CloudinaryService,
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
    module.get<EntityManager>(EntityManager);
    module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        userName: 'John Doe',
        email: 'john.doe@example.com',
        role: RoleEnum.STUDENT,
        code: 'abcdef',
        gender: GenderEnum.MALE,
        phone: '0987654321',
        dateOfBirth: undefined,
        facultyId: '123',
      };
      const user: User = {
        id: '123456',
        userName: createUserDto.userName,
        email: createUserDto.email,
        role: createUserDto.role,
        createdAt: undefined,
        createdBy: '',
        updatedAt: undefined,
        updatedBy: '',
        deletedAt: undefined,
        deletedBy: '',
        code: 'abcdef',
        phone: '0987654321',
        dateOfBirth: undefined,
        avatar: 'abc',
        gender: createUserDto.gender,
        facultyId: '123213',
        faculty: undefined,
        contribution: [],
        contributionComment: [],
        password: '123456789',
      };
      const expectedResult = {
        user: user,
        message: 'Success',
      };
      jest.spyOn(service, 'create').mockResolvedValueOnce(expectedResult);

      const result = await controller.create(createUserDto);

      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const getUserParams: GetUserParams = {
        skip: 0,
        take: 10,
        userName: 'John Doe',
        password: '123456789',
        code: 'abcdef',
        email: 'abc@gmail.com',
        gender: GenderEnum.MALE,
        hone: '',
        dateOfBirth: undefined,
        role: RoleEnum.ADMIN,
        facultyId: '123213',
        avatar: 'abc',
      };

      const user: User = {
        id: '123',
        userName: 'John Doe',
        email: 'john.doe@example.com',
        role: RoleEnum.STUDENT,
        createdAt: undefined,
        createdBy: '',
        updatedAt: undefined,
        updatedBy: '',
        deletedAt: undefined,
        deletedBy: '',
        code: '',
        phone: '',
        dateOfBirth: undefined,
        avatar: '',
        gender: GenderEnum.MALE,
        facultyId: '',
        faculty: undefined,
        contribution: [],
        contributionComment: [],
        password: '123456789',
      };

      const expectedResult: ResponsePaginate<User> = new ResponsePaginate(
        [user],
        new PageMetaDto({
          pageOptionsDto: {
            page: 1,
            take: 10,
            skip: 0,
          },
          itemCount: 1,
        }),
        'Success',
      );

      jest.spyOn(service, 'getUsers').mockResolvedValueOnce(expectedResult);

      const result = await controller.findAll(getUserParams);

      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const user: User = {
        id: '123',
        userName: 'John Doe',
        email: 'john.doe@example.com',
        role: RoleEnum.STUDENT,
        createdAt: undefined,
        createdBy: '',
        updatedAt: undefined,
        updatedBy: '',
        deletedAt: undefined,
        deletedBy: '',
        code: '',
        phone: '',
        dateOfBirth: undefined,
        avatar: '',
        gender: GenderEnum.MALE,
        facultyId: '',
        faculty: undefined,
        contribution: [],
        contributionComment: [],
        password: '123456789',
      };

      jest.spyOn(service, 'getUserById').mockResolvedValueOnce(user);

      const result = await controller.findOneById('1');

      expect(result).toEqual(user);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDto: UpdateUserDto = {
        userName: 'New IT',
        email: 'new.it@example.com',
        password: '123456789',
      };
      const user: User = {
        id: '123',
        userName: updateUserDto.userName,
        email: updateUserDto.email,
        role: RoleEnum.STUDENT,
        createdAt: undefined,
        createdBy: '',
        updatedAt: undefined,
        updatedBy: '',
        deletedAt: undefined,
        deletedBy: '',
        code: '',
        phone: '',
        dateOfBirth: undefined,
        avatar: '',
        gender: GenderEnum.MALE,
        facultyId: '123213',
        faculty: undefined,
        contribution: [],
        contributionComment: [],
        password: '123456789',
      };
      const result = {
        user: user,
        message: 'Successfully update user',
      };
      jest.spyOn(service, 'update').mockResolvedValueOnce(result);

      const response = await controller.update('1', updateUserDto);

      expect(response).toEqual({ result, message: 'Successfully update user' });
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const mockId = '1';
      const result = { data: undefined, message: 'Success' };
      jest.spyOn(service, 'remove').mockResolvedValueOnce(result);

      const response = await controller.remove(mockId);

      expect(service.remove).toHaveBeenCalledWith(mockId);
      expect(response).toEqual({ data: result.data, message: result.message });
    });
  });
});
