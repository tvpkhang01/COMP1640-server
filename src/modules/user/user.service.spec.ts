import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { EntityManager, Repository, SelectQueryBuilder } from 'typeorm';
import { User } from '../../entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateUserDto } from './dto/create-user.dto';
import { GenderEnum, RoleEnum } from '../../common/enum/enum';
import { GetUserParams } from './dto/getList_user.dto';
import { PageOptionsDto } from '../../common/dtos/pageOption';
import { UpdateUserDto } from './dto/update-user.dto';
import { Contribution } from '../../entities/contribution.entity';
import { ContributionComment } from '../../entities/contributionComment.entity';
import { Multer } from 'multer';
import { UploadApiResponse } from 'cloudinary';


describe('UserService', () => {
  let service: UserService;
  let cloudinaryService: CloudinaryService;
  let repository: Repository<User>;
  let entityManager: EntityManager;
  let contributionRepository: Repository<Contribution>;
  let contributionCommentRepository: Repository<ContributionComment>;

  const cloudinaryServiceMock = {
    extractPublicIdFromUrl: jest.fn(),
    uploadImageFile: jest.fn(),
    deleteFile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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
            softDelete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Contribution),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(ContributionComment),
          useClass: Repository,
        },
        {
          provide: CloudinaryService,
          useValue: cloudinaryServiceMock,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    cloudinaryService = module.get<CloudinaryService>(CloudinaryService);
    entityManager = module.get<EntityManager>(EntityManager);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
    contributionRepository = module.get<Repository<Contribution>>(getRepositoryToken(Contribution));
    contributionCommentRepository = module.get<Repository<ContributionComment>>(getRepositoryToken(ContributionComment));
  });


  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const mockCreateUserDto: CreateUserDto = {
        userName: 'John Doe',
        email: 'john.doe@example.com',
        role: RoleEnum.STUDENT,
        code: 'abcdef',
        gender: GenderEnum.MALE,
        phone: '0987654321',
        dateOfBirth: undefined,
        facultyId: '123'
      };
      const expectedResult = {
        user: new User({
          userName: mockCreateUserDto.userName,
          email: mockCreateUserDto.email,
          role: mockCreateUserDto.role,
          code: mockCreateUserDto.code,
          dateOfBirth: mockCreateUserDto.dateOfBirth,
          facultyId: mockCreateUserDto.facultyId,
          gender: mockCreateUserDto.gender,
          phone: mockCreateUserDto.phone,
        }),
        message: 'Successfully create user',
      };

      jest.spyOn(entityManager, 'save').mockResolvedValueOnce(expectedResult.user);

      const result = await service.create(mockCreateUserDto);

      expect(entityManager.save).toHaveBeenCalledWith(expectedResult.user);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getUsers', () => {
    it('should return users with given parameters', async () => {
      const params: GetUserParams = {
        skip: 0,
        take: 10,
        userName: "John Doe",
        role: RoleEnum.STUDENT,
        password: '123456789',
        code: 'abcdef',
        email: 'john.doe@example.com',
        gender: GenderEnum.MALE,
        hone: '',
        dateOfBirth: undefined,
        facultyId: '123',
        avatar: 'abcd'
      };
      const pageOptions: PageOptionsDto = new PageOptionsDto();
      pageOptions.page = 1;
      pageOptions.take = 10;

      const skipValue: number = pageOptions.skip;

      const mockQueryBuilder: Partial<SelectQueryBuilder<User>> = {
        select: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValueOnce([[], 0]),
      };

      const getManyAndCountSpy = jest.spyOn(repository, 'createQueryBuilder').mockReturnValueOnce(mockQueryBuilder as any);
      const result = await service.getUsers(params);
      expect(result.data).toEqual([]);
      expect(result.meta.itemCount).toEqual(0);
      expect(result.message).toBe('Success');

    });
  });

  describe('getUserById', () => {
    it('should return user with given id', async () => {
      const id = '21341123';

      const expectedUser: User = {
        id: '123',
        userName: 'John Doe',
        role: RoleEnum.STUDENT,
        password: '123456789',
        code: 'abcdef',
        email: 'john.doe@example.com',
        gender: GenderEnum.MALE,
        dateOfBirth: undefined,
        facultyId: '123',
        avatar: 'abcd',
        createdAt: undefined,
        createdBy: '',
        updatedAt: undefined,
        updatedBy: '',
        deletedAt: undefined,
        deletedBy: '',
        phone: '',
        faculty: undefined,
        contribution: [],
        contributionComment: []
      };

      const mockQueryBuilder: Partial<SelectQueryBuilder<User>> = {
        select: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValueOnce(expectedUser),
      };

      const getOneSpy = jest.spyOn(repository, 'createQueryBuilder').mockReturnValueOnce(mockQueryBuilder as any);

      const result = await service.getUserById(id);

      expect(result).toEqual(expectedUser);
      expect(getOneSpy).toHaveBeenCalledWith('user');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('user.id = :id', { id });
      expect(mockQueryBuilder.getOne).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDto: UpdateUserDto = {
        userName: 'New IT',
        email: 'new.it@example.com',
        password: '123456789'
      };

      const updatedUser: User = {
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
        password: '123456789'
      };
      const result = {
        user: updatedUser,
        message: 'Successfully update user'
      };
      jest.spyOn(service, 'update').mockResolvedValueOnce(result);

      const response = await service.update('123', updateUserDto);

      expect(service.update).toHaveBeenCalledWith('123', updateUserDto);
      expect(response).toEqual(result);
    });
  });

  describe('remove', () => {
    it('should remove user and associated contributions and comments', async () => {
      const userId = '123';
      const contributions = [new Contribution({}), new Contribution({})];
      const contributionComments = [new ContributionComment({}), new ContributionComment({})];

      const user = {
        id: userId,
        contribution: contributions,
        contributionComment: contributionComments,
      } as unknown as User;

      jest.spyOn(repository, 'createQueryBuilder').mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(user),
      } as any);

      const softDeleteSpy = jest.spyOn(repository, 'softDelete').mockResolvedValue(undefined);
      const softDeleteContributionSpy = jest.spyOn(entityManager, 'softDelete').mockResolvedValue(undefined);

      const result = await service.remove(userId);

      expect(result).toEqual({ data: null, message: 'User deletion successful' });
      expect(softDeleteSpy).toHaveBeenCalledWith(userId);
      expect(softDeleteContributionSpy).toHaveBeenCalledTimes(4);
    });


    it('should return message if user not found', async () => {
      const userId = '123';
      jest.spyOn(repository, 'createQueryBuilder').mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(undefined),
      } as any);

      const result = await service.remove(userId);

      expect(result).toEqual({ message: 'User not found' });
    });
  });

  describe('deleteOldAvatar', () => {
    
  it('should delete old avatar if user has one', async () => {
    const user: User = {
      avatar: 'https://example.com/avatar.jpg',
      id: '123123',
      userName: 'New IT',
      password: '123456789',
      code: '123123',
      email: 'new.it@example.com',
      phone: '0987654321',
      dateOfBirth: undefined,
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
      deletedBy: ''
    };

    const publicId = 'mockPublicId';
    jest.spyOn(cloudinaryService, 'extractPublicIdFromUrl').mockReturnValue(publicId);

    await service.deleteOldAvatar(user);

    expect(cloudinaryService.deleteFile).toHaveBeenCalledWith(publicId);
  });

  it('should not delete old avatar if user does not have one', async () => {
    const user: User = {
      id: '123123',
      userName: 'New IT',
      password: '123456789',
      code: '123123',
      email: 'new.it@example.com',
      phone: '0987654321',
      dateOfBirth: undefined,
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
      avatar: null 
    };

    await service.deleteOldAvatar(user);
    expect(cloudinaryService.deleteFile).toHaveBeenCalledTimes(1);

  });
  });

  describe('uploadAndReturnUrl', () => {

    it('should upload and return URL', async () => {
      const file = { originalname: 'test.png', buffer: Buffer.from('test buffer') } as any as Multer.File;
      const uploadResult: UploadApiResponse = {
        secure_url: 'test_url',
        public_id: '',
        version: 0,
        signature: '',
        width: 0,
        height: 0,
        format: '',
        resource_type: 'image',
        created_at: '',
        tags: [],
        pages: 0,
        bytes: 0,
        type: '',
        etag: '',
        placeholder: false,
        url: '',
        access_mode: '',
        original_filename: '',
        moderation: [],
        access_control: [],
        context: undefined,
        metadata: undefined
      };
    
      jest.spyOn(cloudinaryService, 'uploadImageFile').mockResolvedValue(uploadResult);

      const result = await service.uploadAndReturnUrl(file);

      expect(cloudinaryService.uploadImageFile).toHaveBeenCalledWith(file);
      expect(result).toEqual(uploadResult.secure_url);
    });
  })
});


