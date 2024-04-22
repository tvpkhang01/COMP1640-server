import { Test, TestingModule } from '@nestjs/testing';
import { ContributionCommentController } from './contributionComment.controller';
import { ContributionCommentService } from './contributionComment.service';
import { CreateContributionCommentDto } from './dto/create-contributionComment.dto';
import { GetContributionCommentParams } from './dto/getList-contributionComment.dto';
import { UpdateContributionCommentDto } from './dto/update-contributionComment.dto';
import { EntityManager, Repository } from 'typeorm';
import { ContributionComment } from '../../entities/contributionComment.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ResponsePaginate } from '../../common/dtos/responsePaginate';
import { PageMetaDto } from '../../common/dtos/pageMeta';

describe('ContributionCommentController', () => {
  let controller: ContributionCommentController;
  let service: ContributionCommentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContributionCommentController],
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
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ContributionCommentController>(
      ContributionCommentController,
    );
    service = module.get<ContributionCommentService>(
      ContributionCommentService,
    );
    module.get<EntityManager>(EntityManager);
    module.get<Repository<ContributionComment>>(
      getRepositoryToken(ContributionComment),
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new contribution comment', async () => {
      const dto: CreateContributionCommentDto = {
        contributionId: '123',
        coordinatorId: '456',
        comment: 'Test comment',
      };
      const expectedResult = {
        contributionComment: {
          id: '1',
          contribution: null,
          coordinator: null,
          createdAt: null,
          createdBy: '',
          updatedAt: null,
          updatedBy: '',
          deletedAt: null,
          deletedBy: '',
          ...dto,
        },
        message: 'Successfully create contributionComment',
      };

      jest.spyOn(service, 'create').mockResolvedValueOnce(expectedResult);

      const result = await controller.create(dto);

      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return all contribution comments', async () => {
      const params: GetContributionCommentParams = {
        contributionId: '123',
        coordinatorId: '456',
        comment: 'Test comment',
        skip: 0,
        take: 10,
      };

      const expectedResult: ResponsePaginate<ContributionComment> =
        new ResponsePaginate(
          [
            {
              id: '1',
              contributionId: '123',
              coordinatorId: '456',
              comment: 'Test comment',
              contribution: null,
              coordinator: null,
              createdAt: null,
              createdBy: '',
              updatedAt: null,
              updatedBy: '',
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
        .spyOn(service, 'getContributionComments')
        .mockResolvedValueOnce(expectedResult);

      const result = await controller.findAll(params);

      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return a contribution comment by ID', async () => {
      const id = '1';
      const expectedResult: ContributionComment = {
        id,
        contributionId: '123',
        coordinatorId: '456',
        comment: 'Test comment',
        contribution: null,
        coordinator: null,
        createdAt: null,
        createdBy: '',
        updatedAt: null,
        updatedBy: '',
        deletedAt: null,
        deletedBy: '',
      };

      jest
        .spyOn(service, 'getContributionCommentById')
        .mockResolvedValueOnce(expectedResult);

      const result = await controller.findOne(id);

      expect(result).toEqual(expectedResult);
    });
  });

  describe('update', () => {
    it('should update an existing contribution comment', async () => {
      const id = '1';
      const dto: UpdateContributionCommentDto = {
        contributionId: '123',
        coordinatorId: '456',
        comment: 'Updated comment',
      };
      const expectedResult = {
        contributionComment: {
          id: '1',
          contributionId: dto.contributionId,
          coordinatorId: dto.coordinatorId,
          comment: dto.comment,
          contribution: null,
          coordinator: null,
          createdAt: null,
          createdBy: '',
          updatedAt: null,
          updatedBy: '',
          deletedAt: null,
          deletedBy: '',
          ...dto,
        },
        message: 'Successfully update comment',
      };

      jest.spyOn(service, 'update').mockResolvedValueOnce(expectedResult);

      const result = await controller.update(id, dto);

      expect(result.result.contributionComment).toEqual(
        expectedResult.contributionComment,
      );
    });
  });

  describe('remove', () => {
    it('should remove an existing contribution comment', async () => {
      const id = '1';
      const expectedResult = {
        message: 'Successfully removed contribution comment',
      }; // Assuming service returns this message

      jest.spyOn(service, 'remove').mockResolvedValueOnce(expectedResult);

      const result = await controller.remove(id);

      expect(result).toEqual(expectedResult);
    });
  });
});
