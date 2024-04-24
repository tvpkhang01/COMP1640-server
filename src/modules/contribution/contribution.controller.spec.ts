import { Test, TestingModule } from '@nestjs/testing';
import { ContributionController } from './contribution.controller';
import { ContributionService } from './contribution.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Contribution } from '../../entities/contribution.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { JwtService } from '@nestjs/jwt';
import { CreateContributionDto } from './dto/create-contribution.dto';
import { StatusEnum } from '../../common/enum/enum';
import { GetContributionParams } from './dto/getList_contribition.dto';
import { ResponsePaginate } from '../../common/dtos/responsePaginate';
import { PageMetaDto } from '../../common/dtos/pageMeta';
import { Response } from 'express';
import { UpdateContributionDto } from './dto/update-contribution.dto';
import { Multer } from 'multer';
import { MailService } from '../mail/mail.service';
import { UserService } from '../user/user.service';
import { FacultyService } from '../faculty/faculty.service';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { User } from '../../entities/user.entity';
import { Faculty } from '../../entities/faculty.entity';
import { MagazineService } from '../magazine/magazine.service';
import { SemesterService } from '../semester/semester.service';
import { Semester } from '../../entities/semester.entity';
import { Magazine } from '../../entities/magazine.entity';

// import { Faculty } from 'src/entities/faculty.entity';

describe('ContributionController', () => {
  let controller: ContributionController;
  let service: ContributionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContributionController],
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
          provide: getRepositoryToken(Semester),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Magazine),
          useClass: Repository,
        },
        {
          provide: MailerService,
          useValue: {
            sendMail: jest.fn(),
          },
        },
        CloudinaryService,
        UserService,
        FacultyService,
        MailService,
        ConfigService,
        MagazineService,
        SemesterService,
      ],
    }).compile();

    controller = module.get<ContributionController>(ContributionController);
    service = module.get<ContributionService>(ContributionService);
    module.get<EntityManager>(EntityManager);
    module.get<Repository<Contribution>>(getRepositoryToken(Contribution));
    module.get<Repository<User>>(getRepositoryToken(User));
    module.get<Repository<Faculty>>(getRepositoryToken(Faculty));
    module.get<Repository<Semester>>(getRepositoryToken(Semester));
    module.get<Repository<Magazine>>(getRepositoryToken(Magazine));
    module.get<JwtService>(JwtService);
    module.get<MailService>(MailService);
    module.get<UserService>(UserService);
    module.get<FacultyService>(FacultyService);
    module.get<ConfigService>(ConfigService);
    module.get<MagazineService>(MagazineService);
    module.get<SemesterService>(SemesterService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new contribution', async () => {
      const createDto: CreateContributionDto = {
        title: 'abcd',
        fileImage: [],
        fileDocx: [],
        status: StatusEnum.PENDING,
        studentId: '',
      };
      const expectedResult = {
        contribution: {
          id: '1',
          title: 'Mock Contribution Title',
          content: 'Mock Contribution Content',
          fileImage: [],
          fileDocx: [],
          fileTitle: [{ file: 'Mock File Title' }],
          status: StatusEnum.PENDING,
          studentId: 'mockStudentId',
          // student: {
          //   id: 'mockStudentId',
          //   userName: 'mockUserName',
          //   password: 'mockPassword',
          //   code: 'mockCode',
          //   email: '',
          //   phone:'',
          //   dateOfBirth: new Date(),
          //   avatar: '',
          //   gender: GenderEnum.MALE,
          //   role: RoleEnum.STUDENT,
          //   facultyId: '',
          //   faculty: '',
          //   contribution: '',
          //   contributionComment: '',
          //   createdAt: new Date(),
          //   createdBy: 'mockUserId',
          //   updatedAt: new Date(),
          //   updatedBy: 'mockUserId',
          //   deletedAt: null,
          //   deletedBy: '',

          // },
          student: null,
          magazineId: 'mockMagazineId',
          magazine: null,
          contributionComment: [],
          createdAt: new Date(),
          createdBy: 'mockUserId',
          updatedAt: new Date(),
          updatedBy: 'mockUserId',
          deletedAt: null,
          deletedBy: '',
        },
        message: 'Successfully created contribution',
      };

      jest.spyOn(service, 'create').mockResolvedValueOnce(expectedResult);

      const result = await controller.create(createDto, {});

      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return all contributions', async () => {
      const params: GetContributionParams = {
        title: 'Example Title',
        filePaths: [{ value: 'exampleFilePath' }],
        status: [StatusEnum.PENDING],
        skip: 0,
        take: 10,
      };
      const expectedResult: ResponsePaginate<Contribution> =
        new ResponsePaginate(
          [
            {
              id: '1',
              title: 'Mock Title',
              fileImage: [],
              fileDocx: [],
              fileTitle: [{ file: 'Mock File Title' }],
              status: StatusEnum.PENDING,
              studentId: 'mockStudentId',
              student: null,
              magazineId: 'mockMagazineId',
              magazine: null,
              contributionComment: [],
              createdAt: new Date(),
              createdBy: 'mockUserId',
              updatedAt: new Date(),
              updatedBy: 'mockUserId',
              deletedAt: null,
              deletedBy: '',
            },
          ],
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

      jest
        .spyOn(service, 'getContributions')
        .mockResolvedValueOnce(expectedResult);

      const result = await controller.findAll(params);

      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return a contribution with the given id', async () => {
      const mockId = '1';
      const mockedResult = {
        id: '1',
        title: 'Mock Title',
        fileImage: [],
        fileDocx: [],
        fileTitle: [{ file: 'Mock File Title' }],
        status: StatusEnum.PENDING,
        studentId: 'mockStudentId',
        student: null,
        magazineId: 'mockMagazineId',
        magazine: null,
        contributionComment: [],
        createdAt: new Date(),
        createdBy: 'mockUserId',
        updatedAt: new Date(),
        updatedBy: 'mockUserId',
        deletedAt: null,
        deletedBy: '',
      };
      jest
        .spyOn(service, 'getContributionById')
        .mockResolvedValueOnce(mockedResult);

      const result = await controller.findOne(mockId);

      expect(service.getContributionById).toHaveBeenCalledWith(mockId);
      expect(result).toBe(mockedResult);
    });
  });

  describe('downloadAllContributionsAsZip', () => {
    it('should download all contributions as zip file', async () => {
      const mockZipFilePath = 'mock/path/to/zip/file.zip';
      const mockResponse = {
        download: jest.fn(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as unknown as Response<any, Record<string, any>>;

      jest
        .spyOn(service, 'downloadAllContributionsAsZip')
        .mockResolvedValueOnce(mockZipFilePath);

      await controller.downloadAllContributionsAsZip(mockResponse);

      expect(mockResponse.download).toHaveBeenCalledWith(mockZipFilePath);
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.send).not.toHaveBeenCalled();
    });

    it('should handle error if failed to download all contributions', async () => {
      const mockResponse = {
        download: jest.fn(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as unknown as Response;

      const errorMessage = 'Failed to download all contributions';
      jest
        .spyOn(service, 'downloadAllContributionsAsZip')
        .mockRejectedValueOnce(new Error(errorMessage));

      await controller.downloadAllContributionsAsZip(mockResponse);

      expect(mockResponse.download).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.send).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  describe('downloadContributionFilesAsZip', () => {
    it('should download contribution files as zip', async () => {
      const mockId = '1';
      const mockFilePath = '/mock/file/path.zip';
      const mockResponse: Partial<Response> = {
        download: jest.fn(),
        status: jest.fn(),
        send: jest.fn(),
      };
      jest
        .spyOn(service, 'downloadContributionFilesAsZip')
        .mockResolvedValueOnce(mockFilePath);

      await controller.downloadContributionFilesAsZip(
        mockId,
        mockResponse as Response,
      );

      expect(mockResponse.download).toHaveBeenCalledWith(mockFilePath);
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.send).not.toHaveBeenCalled();
    });

    it('should handle error when downloading contribution files as zip', async () => {
      const mockId = '1';
      const mockError = new Error('Failed to download files');
      const mockResponse: Partial<Response> = {
        download: jest.fn(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };
      jest
        .spyOn(service, 'downloadContributionFilesAsZip')
        .mockRejectedValueOnce(mockError);

      await controller.downloadContributionFilesAsZip(
        mockId,
        mockResponse as Response,
      );

      expect(mockResponse.download).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.send).toHaveBeenCalledWith(
        'Failed to download files',
      );
    });
  });

  describe('downloadMultipleContributionsAsZip', () => {
    it('should download multiple contributions as zip', async () => {
      const mockIds = '1,2,3';
      const mockFileName = '/mock/file/name.zip';
      const mockResponse: Partial<Response> = {
        download: jest.fn(),
        status: jest.fn(),
        send: jest.fn(),
      };
      jest
        .spyOn(service, 'downloadMultipleContributionsAsZip')
        .mockResolvedValueOnce(mockFileName);

      await controller.downloadMultipleContributionsAsZip(
        mockIds,
        mockResponse as Response,
      );

      expect(mockResponse.download).toHaveBeenCalledWith(mockFileName);
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.send).not.toHaveBeenCalled();
    });

    it('should handle error when downloading multiple contributions as zip', async () => {
      const mockIds = '1,2,3';
      const mockError = new Error('Failed to download files');
      const mockResponse: Partial<Response> = {
        download: jest.fn(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };
      jest
        .spyOn(service, 'downloadMultipleContributionsAsZip')
        .mockRejectedValueOnce(mockError);

      await controller.downloadMultipleContributionsAsZip(
        mockIds,
        mockResponse as Response,
      );

      expect(mockResponse.download).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.send).toHaveBeenCalledWith(
        'Failed to download files',
      );
    });
  });

  describe('update', () => {
    it('should update a contribution and return success message', async () => {
      const mockId = '1';
      const updateDto: UpdateContributionDto = {
        title: 'abcd',
        fileImage: [],
        fileDocx: [],
        status: StatusEnum.APPROVE,
      };
      const mockFileImages: Multer.File[] = [
        {
          fieldname: 'imageField',
          originalname: 'image1.jpg',
          encoding: '7bit',
          mimetype: 'image/jpeg',
          size: 12345,
          destination: '/path/to/destination',
          filename: 'image1.jpg',
          path: '/path/to/destination/image1.jpg',
          buffer: Buffer.from('...'),
        },
        {
          fieldname: 'imageField',
          originalname: 'image2.png',
          encoding: '7bit',
          mimetype: 'image/png',
          size: 23456,
          destination: '/path/to/destination',
          filename: 'image2.png',
          path: '/path/to/destination/image2.png',
          buffer: Buffer.from('...'),
        },
      ];
      const mockFileDocxs: Multer.File[] = [
        {
          fieldname: 'docxField',
          originalname: 'document1.docx',
          encoding: '7bit',
          mimetype:
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          size: 12345,
          destination: '/path/to/destination',
          filename: 'document1.docx',
          path: '/path/to/destination/document1.docx',
          buffer: Buffer.from('...'),
        },
        {
          fieldname: 'docxField',
          originalname: 'document2.docx',
          encoding: '7bit',
          mimetype:
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          size: 23456,
          destination: '/path/to/destination',
          filename: 'document2.docx',
          path: '/path/to/destination/document2.docx',
          buffer: Buffer.from('...'),
        },
      ];
      const mockedResult = {
        result: {
          id: '1',
          title: 'Mock Title',
          fileImage: [],
          fileDocx: [],
          fileTitle: [{ file: 'Mock File Title' }],
          status: StatusEnum.PENDING,
          studentId: 'mockStudentId',
          student: null,
          magazineId: 'mockMagazineId',
          magazine: null,
          contributionComment: [],
          createdAt: new Date(),
          createdBy: 'mockUserId',
          updatedAt: new Date(),
          updatedBy: 'mockUserId',
          deletedAt: null,
          deletedBy: '',
        },
        message: 'Successfully update contribution',
      };

      jest.spyOn(service, 'update').mockResolvedValueOnce(mockedResult);

      const result = await controller.update(mockId, updateDto, {
        fileImage: mockFileImages,
        fileDocx: mockFileDocxs,
      });

      expect(service.update).toHaveBeenCalledWith(
        mockId,
        updateDto,
        mockFileImages,
        mockFileDocxs,
      );
      expect(result.result.message).toEqual(mockedResult.message);
    });
  });

  describe('remove', () => {
    it('should remove a contribution and return success message if successful', async () => {
      const mockId = '1';
      const mockedResult = { data: undefined, message: 'Success' };

      jest.spyOn(service, 'remove').mockResolvedValueOnce(mockedResult);

      const result = await controller.remove(mockId);

      expect(service.remove).toHaveBeenCalledWith(mockId);
      expect(result).toEqual({
        data: mockedResult.data,
        message: mockedResult.message,
      });
    });

    it('should return a message if removal fails', async () => {
      const mockId = '1';
      const mockedErrorMessage = 'Failed to remove contribution';

      jest
        .spyOn(service, 'remove')
        .mockResolvedValueOnce({ message: mockedErrorMessage });

      const result = await controller.remove(mockId);

      expect(service.remove).toHaveBeenCalledWith(mockId);
      expect(result.message).toEqual(mockedErrorMessage);
    });
  });
});
