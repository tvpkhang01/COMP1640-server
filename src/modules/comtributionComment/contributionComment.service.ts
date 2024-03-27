import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ContributionComment } from 'src/entities/contributionComment.entity';
import { EntityManager, Repository } from 'typeorm';
import { CreateContributionCommentDto } from './dto/create-contributionComment.dto';
import { GetContributionCommentParams } from './dto/getList-contributionComment.dto';
import { Order } from 'src/common/enum/enum';
import { PageMetaDto } from 'src/common/dtos/pageMeta';
import { ResponsePaginate } from 'src/common/dtos/responsePaginate';

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
      .select(['contributionComment'])
      .skip(params.skip)
      .take(params.take)
      .orderBy('contributionComment.createdAt', Order.DESC);
    if (params.search) {
      contributionComments.andWhere(
        'project.name ILIKE :ContributionCommentName',
        {
          name: `%${params.search}%`,
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
    const contributionComment = new ContributionComment(
      createContributionCommentDto,
    );
    await this.entityManager.save(contributionComment);
    return {
      contributionComment,
      message: 'Successfully create contributionComment',
    };
  }
}
