import { Test, TestingModule } from '@nestjs/testing';
import { ContributionService } from './contribution.service';
import { Contribution } from '../../entities/contribution.entity';
import { EntityManager, Repository, SelectQueryBuilder } from 'typeorm';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateContributionDto } from './dto/create-contribution.dto';
import { Multer } from 'multer';
import {
  GenderEnum,
  Order,
  RoleEnum,
  StatusEnum,
} from '../../common/enum/enum';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GetContributionParams } from './dto/getList_contribition.dto';
import { PageOptionsDto } from '../../common/dtos/pageOption';
import { UserService } from '../user/user.service';
import { User } from '../../entities/user.entity';
import { Faculty } from '../../entities/faculty.entity';
import { MailService } from '../mail/mail.service';
import { JwtService } from '@nestjs/jwt';
import { FacultyService } from '../faculty/faculty.service';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

describe('ContributionService', () => {
  let service: ContributionService;
  let entityManager: EntityManager;
  let contributionsRepository: Repository<Contribution>;
  let mailService: MailService;
  let userService: UserService;
  let facultyService: FacultyService;

  const mockMailService = {
    sendPendingMail: jest.fn(),
    sendApproveMail: jest.fn(),
    sendRejectMail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContributionService,
        {
          provide: getRepositoryToken(Contribution),
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
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Faculty),
          useClass: Repository,
        },
        {
          provide: MailerService,
          useValue: {
            sendMail: jest.fn(),
          },
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
        CloudinaryService,
        UserService,
        FacultyService,
        ConfigService,
      ],
    }).compile();

    service = module.get<ContributionService>(ContributionService);
    entityManager = module.get<EntityManager>(EntityManager);
    contributionsRepository = module.get<Repository<Contribution>>(
      getRepositoryToken(Contribution),
    );
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    facultyRepository = module.get<Repository<Faculty>>(
      getRepositoryToken(Faculty),
    );
    jwtService = module.get<JwtService>(JwtService);
    mailService = module.get<MailService>(MailService);
    userService = module.get<UserService>(UserService);
    facultyService = module.get<FacultyService>(FacultyService);
    configService = module.get<ConfigService>(ConfigService);
    mailerService = module.get<MailerService>(MailerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a contribution successfully', async () => {
      const createContributionDto: CreateContributionDto = {
        studentId: 'example',
        title: 'example',
        status: StatusEnum.PENDING,
        fileImage: [],
        fileDocx: [],
      };
      const fileImages: Multer.File[] = [];
      const fileDocxs: Multer.File[] = [];

      // Mock repository methods
      jest
        .spyOn(service as any, 'createAndUploadTitleFile')
        .mockResolvedValue('example');
      jest
        .spyOn(service as any, 'uploadAndReturnImageUrl')
        .mockResolvedValue('example');
      jest
        .spyOn(service as any, 'uploadAndReturnDocxUrl')
        .mockResolvedValue('example');
      jest.spyOn(entityManager, 'save').mockResolvedValue(undefined);
      jest.spyOn(userService, 'getUserById').mockResolvedValue({
        id: 'example',
        userName: 'abc',
        password: 'examplePassword',
        code: 'exampleCode',
        email: 'user@example.com',
        phone: '123456789',
        dateOfBirth: new Date('1990-01-01'),
        avatar: 'avatar.jpg',
        gender: GenderEnum.MALE,
        role: RoleEnum.STUDENT,
        facultyId: 'faculty123',
        faculty: undefined,
        contribution: undefined,
        contributionComment: undefined,
        createdAt: new Date(),
        createdBy: 'exampleUserId',
        updatedAt: new Date(),
        updatedBy: 'exampleUserId',
        deletedAt: new Date(),
        deletedBy: 'exampleUserId',
      });

      jest.spyOn(facultyService, 'getFacultyById').mockResolvedValue({
        id: 'faculty123',
        facultyName: 'Example Faculty',
        student: undefined,
        coordinator: undefined,
        coordinatorId: 'coordinator123',
        createdAt: new Date(),
        createdBy: 'exampleUserId',
        updatedAt: new Date(),
        updatedBy: 'exampleUserId',
        deletedAt: new Date(),
        deletedBy: 'exampleUserId',
      });
      jest.spyOn(userService, 'getUserById').mockResolvedValue({
        id: 'exampleId',
        email: 'coordinator@example.com',
        userName: 'Coordinator Name',
        password: 'examplePassword',
        code: 'exampleCode',
        phone: 'examplePhone',
        dateOfBirth: new Date(),
        avatar: 'exampleAvatar',
        gender: GenderEnum.MALE,
        role: RoleEnum.STUDENT,
        facultyId: 'faculty123',
        faculty: undefined,
        contribution: undefined,
        contributionComment: undefined,
        createdAt: new Date(),
        createdBy: 'exampleUserId',
        updatedAt: new Date(),
        updatedBy: 'exampleUserId',
        deletedAt: new Date(),
        deletedBy: 'exampleUserId',
      });
      jest.spyOn(mailService, 'sendPendingMail').mockResolvedValue(undefined);

      const result = await service.create(
        createContributionDto,
        fileImages,
        fileDocxs,
      );

      expect(result).toEqual({
        contribution: expect.any(Contribution),
        message: 'Successfully create contribution',
      });
      expect(mailService.sendPendingMail).toHaveBeenCalled();

      // Kiểm tra các tham số được truyền vào hàm sendPendingMail
      expect(mailService.sendPendingMail).toHaveBeenCalledWith(
        result.contribution.id, // Pass the id of the newly created contribution
        'coordinator@example.com', // Assuming you want to check the email of the coordinator
        'Coordinator Name', // Assuming you want to check the name of the coordinator
      );
    });
  });

  describe('getContributions', () => {
    it('should return contributions with given parameters', async () => {
      const params: GetContributionParams = {
        status: [StatusEnum.APPROVE],
        skip: 0,
        take: 10,
        order: Order.ASC,
        searchByTitle: 'example',
        searchByUserName: 'user123',
        title: 'Example Title',
        filePaths: [{ value: '/path/to/file' }],
      };
      const pageOptions: PageOptionsDto = new PageOptionsDto();
      pageOptions.page = 1;
      pageOptions.take = 10;

      const result = await service.getContributions(params);
      expect(result.data).toEqual([]);
      expect(result.meta.itemCount).toEqual(0);
      expect(result.message).toBe('Success');
    });
  });

  describe('getContributionById', () => {
    it('should return contribution with given id', async () => {
      const id = '21341123';

      const expectedContribution: Contribution = {
        id: '',
        title: '',
        fileImage: [],
        fileDocx: [],
        fileTitle: [],
        status: StatusEnum.APPROVE,
        studentId: '',
        student: undefined,
        magazineId: '',
        magazine: undefined,
        contributionComment: [],
        createdAt: undefined,
        createdBy: '',
        updatedAt: undefined,
        updatedBy: '',
        deletedAt: undefined,
        deletedBy: '',
      };

      const mockQueryBuilder: Partial<SelectQueryBuilder<Contribution>> = {
        select: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValueOnce(expectedContribution),
      };

      const getOneSpy = jest
        .spyOn(contributionsRepository, 'createQueryBuilder')
        .mockReturnValueOnce(mockQueryBuilder as any);

      const result = await service.getContributionById(id);

      expect(result).toEqual(expectedContribution);
      expect(getOneSpy).toHaveBeenCalledWith('contribution');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'contribution.id = :id',
        { id },
      );
      expect(mockQueryBuilder.getOne).toHaveBeenCalled();
    });
  });

  describe('update', () => {});

  describe('remove', () => {
    it('should remove contribution and associated files', async () => {
      const contributionId = '123';
      const files = [{}, {}];

      const contribution = {
        id: contributionId,
        images: files,
        docxs: files,
      } as unknown as Contribution;

      jest
        .spyOn(contributionsRepository, 'createQueryBuilder')
        .mockReturnValue({
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockResolvedValue(contribution),
        } as any);

      const softDeleteSpy = jest
        .spyOn(contributionsRepository, 'softDelete')
        .mockResolvedValue(undefined);
      const softDeleteFileSpy = jest
        .spyOn(entityManager, 'softDelete')
        .mockResolvedValue(undefined);

      const result = await service.remove(contributionId);

      expect(result).toEqual({
        data: null,
        message: 'Contribution deletion successful',
      });
      expect(softDeleteSpy).toHaveBeenCalledWith(contributionId);
      expect(softDeleteFileSpy).toHaveBeenCalledTimes(0);
    });

    it('should return message if contribution not found', async () => {
      const contributionId = '123';
      jest
        .spyOn(contributionsRepository, 'createQueryBuilder')
        .mockReturnValue({
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockResolvedValue(undefined),
        } as any);

      const result = await service.remove(contributionId);

      expect(result).toEqual({ message: 'Contribution not found' });
    });
  });
});
