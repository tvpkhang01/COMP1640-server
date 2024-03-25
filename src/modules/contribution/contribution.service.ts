import { Injectable } from '@nestjs/common';
import { CreateContributionDto } from './dto/create-contribution.dto';
import { UpdateContributionDto } from './dto/update-contribution.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Contribution } from 'src/entities/contribution.entity';
import { EntityManager, Repository } from 'typeorm';
import { GetContributionParams } from './dto/getList_contribition.dto';
import { Order } from 'src/common/enum/enum';
import { PageMetaDto } from 'src/common/dtos/pageMeta';
import { ResponsePaginate } from 'src/common/dtos/responsePaginate';

@Injectable()
export class ContributionService {
  constructor(
    @InjectRepository(Contribution)
    private readonly contributionsRepository: Repository<Contribution>,
    private readonly entityManager: EntityManager,
  ) {}

  async create(createContributionDto: CreateContributionDto) {
    const contribution = new Contribution(createContributionDto);
    await this.entityManager.save(contribution);
    return { contribution, message: 'Successfully create contribution' };
  }

  async getContributions(params: GetContributionParams) {
    const contributions = this.contributionsRepository
      .createQueryBuilder('contribution')
      .select(['contribution', 'student'])
      .leftJoin('contribution.student', 'student')
      .skip(params.skip)
      .take(params.take)
      .orderBy('contribution.createdAt', Order.DESC);
    if (params.search) {
      contributions.andWhere('contribution.title ILIKE :title', {
        Title: `%${params.search}%`,
      });
    }
    const [result, total] = await contributions.getManyAndCount();
    const pageMetaDto = new PageMetaDto({
      itemCount: total,
      pageOptionsDto: params,
    });
    return new ResponsePaginate(result, pageMetaDto, 'Success');
  }

  async getContributionById(id: string) {
    const contribution = await this.contributionsRepository
      .createQueryBuilder('contribution')
      .select(['contribution', 'student'])
      .leftJoin('contribution.student', 'student')
      .where('contribution.id = :id', { id })
      .getOne();
    return contribution;
  }

  async update(id: string, updateContributionDto: UpdateContributionDto) {
    const contribution = await this.contributionsRepository.findOneBy({ id });
    if (contribution) {
      contribution.title = updateContributionDto.title;
      contribution.filePaths = updateContributionDto.filePaths;
      contribution.status = updateContributionDto.status;
      await this.entityManager.save(contribution);
      return { contribution, message: 'Successfully update contribution' };
    }
  }

  async remove(id: string) {
    const contribution = await this.contributionsRepository.findOneBy({ id });
    if (!contribution) {
      return { message: 'Contribution not found' };
    }
    await this.contributionsRepository.softDelete(id);
    return { data: null, message: 'Contribution deletion successful' };
  }
}