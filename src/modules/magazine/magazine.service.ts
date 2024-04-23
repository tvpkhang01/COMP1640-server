import { Injectable } from '@nestjs/common';
import { CreateMagazineDto } from './dto/create-magazine.dto';
import { UpdateMagazineDto } from './dto/update-magazine.dto';
import { GetMagazineParams } from './dto/getList-magazine.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Order } from '../../common/enum/enum';
import { PageMetaDto } from '../../common/dtos/pageMeta';
import { ResponsePaginate } from '../../common/dtos/responsePaginate';
import { Magazine } from '../../entities/magazine.entity';
import { Contribution } from '../../entities/contribution.entity';
import { ContributionComment } from '../../entities/contributionComment.entity';

@Injectable()
export class MagazineService {
  constructor(
    @InjectRepository(Magazine)
    private readonly magazinesRepository: Repository<Magazine>,
    private readonly entityManager: EntityManager,
  ) {}
  async getMagazines(params: GetMagazineParams) {
    const magazines = this.magazinesRepository
      .createQueryBuilder('magazine')
      .select(['magazine', 'semester'])
      .leftJoin('magazine.semester', 'semester')
      .skip(params.skip)
      .take(params.take)
      .orderBy('magazine.createdAt', Order.DESC);
    if (params.search) {
      magazines.andWhere('magazine.magazineName ILIKE :magazineName', {
        magazineName: `%${params.search}%`,
      });
    }

    const [result, total] = await magazines.getManyAndCount();
    const pageMetaDto = new PageMetaDto({
      itemCount: total,
      pageOptionsDto: params,
    });
    return new ResponsePaginate(result, pageMetaDto, 'Success');
  }
  async getTotalMagazine(period: string) {
    // Đếm tổng số tạp chí hiện có
    const total = await this.magazinesRepository.count();

    // Tính năm trước
    const pastYear = new Date();
    pastYear.setFullYear(pastYear.getFullYear() - 1);

    // Khai báo các biến để lưu trữ số lượng tạp chí cũ và hiện tại
    let oldCount, currentCount;

    // Nếu khoảng thời gian là 'năm'
    if (period === 'year') {
      // Đếm số lượng tạp chí trong năm trước và năm hiện tại
      oldCount = await this.magazinesRepository
        .createQueryBuilder('magazine')
        .where('EXTRACT(YEAR FROM magazine.createdAt) = :pastYear', {
          pastYear: pastYear.getFullYear(),
        })
        .getCount();

      currentCount = await this.magazinesRepository
        .createQueryBuilder('magazine')
        .where('EXTRACT(YEAR FROM magazine.createdAt) = :currentYear', {
          currentYear: new Date().getFullYear(),
        })
        .getCount();
    } else if (period === 'month') {
      const currentMonth = new Date().getMonth() + 1;
      const pastMonth = currentMonth - 1 === 0 ? 12 : currentMonth - 1;
      const currentYear = new Date().getFullYear();

      oldCount = await this.magazinesRepository
        .createQueryBuilder('magazine')
        .where('EXTRACT(YEAR FROM magazine.createdAt) = :currentYear', {
          currentYear: currentYear,
        })
        .andWhere('EXTRACT(MONTH FROM magazine.createdAt) = :pastMonth', {
          pastMonth: pastMonth,
        })
        .getCount();

      currentCount = await this.magazinesRepository
        .createQueryBuilder('magazine')
        .where('EXTRACT(YEAR FROM magazine.createdAt) = :currentYear', {
          currentYear: currentYear,
        })
        .andWhere('EXTRACT(MONTH FROM magazine.createdAt) = :currentMonth', {
          currentMonth: currentMonth,
        })
        .getCount();
    }

    const percentageMagazineChange =
      oldCount === 0 ? 100 : ((currentCount - oldCount) / oldCount) * 100;

    return {
      total,
      oldCount,
      currentCount,
      percentageMagazineChange,
    };
  }
  async getMagazineById(id: string) {
    const magazine = await this.magazinesRepository
      .createQueryBuilder('magazine')
      .select(['magazine', 'semester'])
      .leftJoin('magazine.semester', 'semester')
      .where('magazine.id = :id', { id })
      .getOne();
    return magazine;
  }
  async create(createMagazineDto: CreateMagazineDto) {
    const magazine = new Magazine(createMagazineDto);
    await this.entityManager.save(magazine);
    return { magazine, message: 'Successfully create magazine' };
  }

  async update(id: string, updateMagazineDto: UpdateMagazineDto) {
    const magazine = await this.magazinesRepository.findOneBy({ id });
    if (magazine) {
      magazine.semesterId = updateMagazineDto.semesterId;
      magazine.magazineName = updateMagazineDto.magazineName;
      magazine.openDate = updateMagazineDto.openDate;
      magazine.closeDate = updateMagazineDto.closeDate;

      await this.entityManager.save(magazine);
      return { magazine, message: 'Successfully update magazine' };
    }
  }

  async remove(id: string) {
    const magazine = await this.magazinesRepository
      .createQueryBuilder('magazine')
      .leftJoinAndSelect('magazine.contribution', 'contribution')
      .where('magazine.id = :id', { id })
      .getOne();

    if (!magazine) {
      return { message: 'Magazine not found' };
    }

    if (magazine.contribution.length > 0) {
      for (const contribution of magazine.contribution) {
        await this.entityManager.softDelete(Contribution, contribution.id);
        await this.entityManager.softDelete(ContributionComment, {
          contributionId: contribution.id,
        });
      }
    }
    await this.magazinesRepository.softDelete(id);
    return { data: null, message: 'Magazine deletion successful' };
  }
}
