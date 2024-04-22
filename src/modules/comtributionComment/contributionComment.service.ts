import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ContributionComment } from '../../entities/contributionComment.entity';
import { EntityManager, Repository } from 'typeorm';
import { CreateContributionCommentDto } from './dto/create-contributionComment.dto';
import { GetContributionCommentParams } from './dto/getList-contributionComment.dto';
import { Order } from '../../common/enum/enum';
import { PageMetaDto } from '../../common/dtos/pageMeta';
import { ResponsePaginate } from '../../common/dtos/responsePaginate';
import { UpdateContributionCommentDto } from './dto/update-contributionComment.dto';

@Injectable()
export class ContributionCommentService {
  constructor(
    @InjectRepository(ContributionComment)
    private readonly contributionCommentsRepository: Repository<ContributionComment>,
    private readonly entityManager: EntityManager,
  ) {}

  async getContributionComments(params: GetContributionCommentParams) {
    const contributionComments = this.contributionCommentsRepository
      .createQueryBuilder('contributionComment')
      .select(['contributionComment', 'coordinator', 'contribution'])
      .leftJoin('contributionComment.coordinator', 'coordinator')
      .leftJoin('contributionComment.contribution', 'contribution')
      .skip(params.skip)
      .take(params.take)
      .orderBy('contributionComment.createdAt', Order.DESC);
    if (params.search) {
      contributionComments.andWhere(
        'contributionComment.comment ILIKE :comment',
        {
          comment: `%${params.search}%`,
        },
      );
    }

    const [result, total] = await contributionComments.getManyAndCount();
    const pageMetaDto = new PageMetaDto({
      itemCount: total,
      pageOptionsDto: params,
    });
    return new ResponsePaginate(result, pageMetaDto, 'Success');
  }
  async getContributionCommentById(id: string) {
    const contributionComment = await this.contributionCommentsRepository
      .createQueryBuilder('contributionComment')
      .select(['contributionComment'])
      .where('contributionComment.id = :id', { id })
      .getOne();
    return contributionComment;
  }
  async create(createContributionCommentDto: CreateContributionCommentDto) {
    try {
      const contributionComment = new ContributionComment(
        createContributionCommentDto,
      );
      const savedComment = await this.entityManager.save(contributionComment);
      return {
        contributionComment: savedComment,
        message: 'Successfully create contributionComment',
      };
    } catch (error) {
      console.error('Error creating contribution comment:', error);
      throw error; // Re-throw the error to fail the test
    }
  }

  async update(
    id: string,
    updateContributionCommentDto: UpdateContributionCommentDto,
  ) {
    const contributionComment =
      await this.contributionCommentsRepository.findOneBy({ id });
    if (contributionComment) {
      contributionComment.contributionId =
        updateContributionCommentDto.contributionId;
      contributionComment.coordinatorId =
        updateContributionCommentDto.coordinatorId;
      contributionComment.comment = updateContributionCommentDto.comment;

      await this.entityManager.save(contributionComment);
      return { contributionComment, message: 'Successfully update comment' };
    }
  }

  async remove(id: string) {
    const contributionComment =
      await this.contributionCommentsRepository.findOneBy({ id });
    if (!contributionComment) {
      return { message: 'comment not found' };
    }
    await this.contributionCommentsRepository.softDelete(id);
    return { data: null, message: 'comment deletion successful' };
  }
}
