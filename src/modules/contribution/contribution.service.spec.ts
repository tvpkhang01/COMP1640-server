import { Test, TestingModule } from '@nestjs/testing';
import { ContributionService } from './contribution.service';
import { Contribution } from '../../entities/contribution.entity';
import { EntityManager, Repository, SelectQueryBuilder } from 'typeorm';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateContributionDto } from './dto/create-contribution.dto';
import { Multer } from 'multer';
import { Order, StatusEnum } from '../../common/enum/enum';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GetContributionParams } from './dto/getList_contribition.dto';
import { PageOptionsDto } from '../../common/dtos/pageOption';
import { UpdateContributionDto } from './dto/update-contribution.dto';
import { ContributionComment } from '../../entities/contributionComment.entity';

describe('ContributionService', () => {
  let service: ContributionService;
  let entityManager: EntityManager;
  let contributionsRepository: Repository<Contribution>;

  const createContributionDto: CreateContributionDto = {
    title: 'Test Contribution',
    fileImage: [],
    fileDocx: [],
    status: StatusEnum.APPROVE,
  };

  const fileImages: Multer.File[] = [
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

  const fileDocxs: Multer.File[] = [
    {
      fieldname: 'docxField',
      originalname: 'document1.docx',
      encoding: '7bit',
      mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
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
      mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      size: 23456,
      destination: '/path/to/destination',
      filename: 'document2.docx',
      path: '/path/to/destination/document2.docx',
      buffer: Buffer.from('...'),
    },
  ];


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
          },
        },
        CloudinaryService,
      ],
    }).compile();

    service = module.get<ContributionService>(ContributionService);
    entityManager = module.get<EntityManager>(EntityManager);
    contributionsRepository = module.get<Repository<Contribution>>(
      getRepositoryToken(Contribution),)
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a contribution', async () => {
    const createAndUploadTitleFileSpy = jest.spyOn(service as any, 'createAndUploadTitleFile').mockResolvedValue('titleFileUrl');
    const uploadAndReturnImageUrlSpy = jest.spyOn(service as any, 'uploadAndReturnImageUrl').mockResolvedValue('imageUrl');
    const uploadAndReturnDocxUrlSpy = jest.spyOn(service as any, 'uploadAndReturnDocxUrl').mockResolvedValue('docxUrl');
    const entityManagerSaveSpy = jest.spyOn(entityManager, 'save').mockResolvedValue(undefined);

    await service.create(createContributionDto, fileImages, fileDocxs);

    expect(createAndUploadTitleFileSpy).toHaveBeenCalledWith(createContributionDto.title);
    expect(uploadAndReturnImageUrlSpy).toHaveBeenCalledTimes(fileImages.length);
    expect(uploadAndReturnDocxUrlSpy).toHaveBeenCalledTimes(fileDocxs.length);
    expect(entityManagerSaveSpy).toHaveBeenCalledWith(expect.any(Contribution));
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

      const skipValue: number = pageOptions.skip;

      const mockQueryBuilder: Partial<SelectQueryBuilder<Contribution>> = {
        select: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValueOnce([[], 0]),
      };

      const getManyAndCountSpy = jest.spyOn(contributionsRepository, 'createQueryBuilder').mockReturnValueOnce(mockQueryBuilder as any);
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
        deletedBy: ''
      };

      const mockQueryBuilder: Partial<SelectQueryBuilder<Contribution>> = {
        select: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValueOnce(expectedContribution),
      };

      const getOneSpy = jest.spyOn(contributionsRepository, 'createQueryBuilder').mockReturnValueOnce(mockQueryBuilder as any);

      const result = await service.getContributionById(id);

      expect(result).toEqual(expectedContribution);
      expect(getOneSpy).toHaveBeenCalledWith('contribution');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('contribution.id = :id', { id });
      expect(mockQueryBuilder.getOne).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update contribution with valid input', async () => {
      // Mocking the inputs
      const id = '123456';
      const updateContributionDto: UpdateContributionDto = {
        title: 'New Title',
        status: StatusEnum.APPROVE,
        fileImage: [
          { file: 'path/to/image1.jpg' },
          { file: 'path/to/image2.jpg' }
        ],
        fileDocx: [
          { file: 'path/to/docx1.docx' },
          { file: 'path/to/docx2.docx' }
        ]
      };

      const fileImages: Multer.File[] = [
        { originalname: 'image1.jpg', path: '/path/to/image1.jpg' },
        { originalname: 'image2.jpg', path: '/path/to/image2.jpg' },
      ];
      const fileDocxs: Multer.File[] = [
        { originalname: 'docx1.docx', path: '/path/to/docx1.docx' },
        { originalname: 'docx2.docx', path: '/path/to/docx2.docx' },
      ];

      // Mocking the functions
      const findOneBySpy = jest.spyOn(contributionsRepository, 'findOneBy').mockResolvedValueOnce({
        id: '123456',
        title: 'Old Title',
        status: StatusEnum.PENDING,
      } as Contribution);

      const deleteOldImageFilesSpy = jest.spyOn(service, 'deleteOldImageFiles').mockResolvedValueOnce(undefined);
      const deleteOldDocxFilesSpy = jest.spyOn(service, 'deleteOldDocxFiles').mockResolvedValueOnce(undefined);
      const uploadAndReturnImageUrlSpy = jest.spyOn(service as any, 'uploadAndReturnImageUrl').mockResolvedValue('imageUrl');
      const uploadAndReturnDocxUrlSpy = jest.spyOn(service as any, 'uploadAndReturnDocxUrl').mockResolvedValue('docxUrl');
      const createAndUploadTitleFileSpy = jest.spyOn(service as any , 'createAndUploadTitleFile').mockResolvedValue('title')

      // Call the update method with all required arguments
      await service.update(id, updateContributionDto, fileImages, fileDocxs);

      // Assertions
      expect(findOneBySpy).toHaveBeenCalledWith({ id });
      expect(deleteOldImageFilesSpy).toHaveBeenCalled();
      expect(deleteOldDocxFilesSpy).toHaveBeenCalled();
      expect(uploadAndReturnImageUrlSpy).toHaveBeenCalled();
      expect(uploadAndReturnDocxUrlSpy).toHaveBeenCalled();
      expect(createAndUploadTitleFileSpy).toHaveBeenCalled();
    });

  });

  describe('remove', () => {
    it('should remove contribution successfully', async () => {
      // Mocking the contributionsRepository and entityManager methods
      const getOneMock = jest.fn().mockResolvedValueOnce({
        id: '123',
        contributionComment: [{ id: 'commentId1' }, { id: 'commentId2' }],
      });
      const softDeleteMock = jest.fn().mockResolvedValueOnce(undefined);
      const softDeleteCommentsMock = jest.fn().mockResolvedValueOnce(undefined);
    
      const contributionsRepositoryMock = {
        createQueryBuilder: jest.fn().mockReturnValue({
          leftJoinAndSelect: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnThis(),
            getOne: getOneMock,
          }),
        }),
        softDelete: softDeleteMock,
      };
      const contributionCommentRepositoryMock = {
        softDelete: softDeleteCommentsMock,
      }
    
      const entityManagerMock = {
        softDelete: softDeleteCommentsMock,
      };
    
      const service = new ContributionService(
        contributionsRepositoryMock as any,
        entityManagerMock as any,
        contributionCommentRepositoryMock as any,
      );
    
      // Call the remove method with a valid ID
      const result = await service.remove('123');
    
      // Assertions
      expect(getOneMock).toHaveBeenCalledWith();
      expect(getOneMock).toHaveBeenCalledTimes(1);
      expect(softDeleteCommentsMock).toHaveBeenCalledWith(ContributionComment, {
        id: 'commentId1',
      });
      expect(softDeleteCommentsMock).toHaveBeenCalledWith(ContributionComment, {
        id: 'commentId2',
      });
      expect(softDeleteCommentsMock).toHaveBeenCalledTimes(2);
      expect(softDeleteMock).toHaveBeenCalledWith('123');
      expect(softDeleteMock).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        data: null,
        message: 'Contribution deletion successful',
      });
    });
    
    it('should return error if contribution not found', async () => {
      // Mocking the contributionsRepository method to return undefined
      const getOneMock = jest.fn().mockResolvedValueOnce(undefined);
    
      const contributionsRepositoryMock = {
        createQueryBuilder: jest.fn().mockReturnValue({
          leftJoinAndSelect: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnThis(),
            getOne: getOneMock,
          }),
        }),
      };
    
      const cloudinaryServiceMock = {}; // Tạo một mock cho cloudinaryService
      const service = new ContributionService(
        contributionsRepositoryMock as any,
        entityManager as any,
        cloudinaryServiceMock as any
      );
    
      // Call the remove method with an invalid ID
      const result = await service.remove('invalidId');
    
      // Assertions
      expect(getOneMock).toHaveBeenCalledWith();

      expect(getOneMock).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ message: 'Contribution not found' });
    });
    
  });
  


});
