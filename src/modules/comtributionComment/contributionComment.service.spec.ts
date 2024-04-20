import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { ContributionCommentService } from './contributionComment.service';
import { ContributionComment } from '../../entities/contributionComment.entity';
import { GetContributionCommentParams } from './dto/getList-contributionComment.dto';
import { ResponsePaginate } from '../../common/dtos/responsePaginate';
import { Order } from '../../common/enum/enum';
import { ContributionCommentController } from './contributionComment.controller';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '../auth/utils/constants';
import { CreateContributionCommentDto } from './dto/create-contributionComment.dto';
import { UpdateContributionCommentDto } from './dto/update-contributionComment.dto';

describe('ContributionCommentService', () => {
    let service: ContributionCommentService;
    let repository: Repository<ContributionComment>;
    let entityManager: EntityManager;
    
    const mockContributionCommentRepository = {
      findOneBy: jest.fn(),
      softDelete: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          ContributionCommentService,
          {
            provide: getRepositoryToken(ContributionComment),
            useClass: Repository,
          },
          {
            provide: EntityManager,
            useValue: {
              save: jest.fn(),
            },
          },
        ],
      }).compile();
  
      service = module.get<ContributionCommentService>(ContributionCommentService);
      entityManager = module.get<EntityManager>(EntityManager);
      repository = module.get<Repository<ContributionComment>>(
      getRepositoryToken(ContributionComment),)
    });
    afterEach(() => {
        jest.clearAllMocks();
      });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getContributionComments', () => {
    it('should return contribution comments', async () => {
      // Arrange
      const params: GetContributionCommentParams = { contributionId: '1', coordinatorId: '1', comment: 'Test comment', skip: 0, take: 10 };
      const mockResult = [{ id: '1', contributionId: '1', coordinatorId: '1', comment: 'Test comment' }];
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValueOnce([mockResult, mockResult.length]),
      };
      jest.spyOn(repository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      const result = await service.getContributionComments(params);

      expect(result.data).toEqual(mockResult);
      expect(result.meta).toBeDefined();
      expect(result.meta.itemCount).toEqual(mockResult.length);
    });
  });

  describe('getContributionCommentById', () => {
    it('should return a contribution comment by ID', async () => {
      const mockContributionComment: ContributionComment = {
          id: '1',
          contributionId: '123456',
          coordinatorId: '123456',
          comment: 'abcde',
          contribution: undefined,
          coordinator: undefined,
          createdAt: undefined,
          createdBy: '',
          updatedAt: undefined,
          updatedBy: '',
          deletedAt: undefined,
          deletedBy: ''
      };

      jest.spyOn(repository, 'createQueryBuilder').mockReturnValue({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockContributionComment),
      } as any);

      const result = await service.getContributionCommentById('1');
      expect(result).toEqual(mockContributionComment);
    });
  });

  describe('create', () => {
    it('should create a new contribution comment', async () => {
      const createDto: CreateContributionCommentDto = {
        contributionId: '123456',
        coordinatorId: '123456',
        comment: 'abcde',
      };
  
      const mockContributionComment: ContributionComment = {
        id: '1',
        contributionId: '123456',
        coordinatorId: '123456',
        comment: 'abcde',
        contribution: undefined,
        coordinator: undefined,
        createdAt: undefined,
        createdBy: '',
        updatedAt: undefined,
        updatedBy: '',
        deletedAt: undefined,
        deletedBy: ''
      };
  
      jest.spyOn(entityManager, 'save').mockResolvedValueOnce(
        mockContributionComment as any,
      );
  
      const result = await service.create(createDto);
      expect(result.contributionComment).toEqual(mockContributionComment);
      expect(result.message).toBe('Successfully create contributionComment');
    });
  });
  
  describe('update', () => {
    it('should update an existing contribution comment', async () => {
      const id = '7ca93447-2dd7-46fe-bdf7-7bf8355d5faf';
      const updateDto: UpdateContributionCommentDto = {
        contributionId: '7ed57784-274e-4530-95aa-b0fa5cdc4327',
        coordinatorId: '1557a3fc-dc64-4d71-aef3-1c5c4cf820a2',
        comment: 'updated comment',
      };
  
      const existingComment: ContributionComment = {
        id: '7ca93447-2dd7-46fe-bdf7-7bf8355d5faf',
        contributionId: '123',
        coordinatorId: '456',
        comment: 'original comment',
        contribution: undefined,
        coordinator: undefined,
        createdAt: undefined,
        createdBy: '',
        updatedAt: undefined,
        updatedBy: '',
        deletedAt: undefined,
        deletedBy: ''
      };
  
      jest.spyOn(repository, 'findOneBy').mockResolvedValueOnce(existingComment); 
      jest.spyOn(repository, 'save').mockResolvedValueOnce(existingComment); 
  
      const result = await service.update(id, updateDto);
      expect(result.contributionComment).toBeDefined(); 
      expect(result.contributionComment.comment).toBe(updateDto.comment);
      expect(result.message).toBe('Successfully update comment');
    });
  });


  describe('remove', () => {
    it('should remove an existing contribution comment', async () => {
        // Arrange
        const id = '7ca93447-2dd7-46fe-bdf7-7bf8355d5faf';
        const contributionComment: ContributionComment = {
          id: '7ca93447-2dd7-46fe-bdf7-7bf8355d5faf',
          contributionId: '123',
          coordinatorId: '456',
          comment: 'original comment',
          contribution: undefined,
          coordinator: undefined,
          createdAt: undefined,
          createdBy: '',
          updatedAt: undefined,
          updatedBy: '',
          deletedAt: undefined,
          deletedBy: ''
        };
        jest.spyOn(repository, 'findOneBy').mockResolvedValueOnce(contributionComment);
        const mockSoftDelete = jest.fn().mockResolvedValueOnce('');
        jest.spyOn(repository, 'softDelete').mockImplementation(mockSoftDelete);
        
        // Act
        await service.remove(id);

        // Assert
        expect(repository.findOneBy).toHaveBeenCalledWith({ id }); // Use findOneBy instead of findOne
        expect(repository.softDelete).toHaveBeenCalledWith(id); // Pass the ID to softDelete
    });

});

});
