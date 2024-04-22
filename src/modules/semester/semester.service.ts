import { Injectable } from '@nestjs/common';
import { CreateSemesterDto } from './dto/create-semester.dto';
import { UpdateSemesterDto } from './dto/update-semester.dto';
import { Semester } from '../../entities/semester.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { GetSemesterParams } from './dto/getList_semester.dto';
import { Order } from '../../common/enum/enum';
import { PageMetaDto } from '../../common/dtos/pageMeta';
import { ResponsePaginate } from '../../common/dtos/responsePaginate';
import { Magazine } from '../../entities/magazine.entity';
import { Contribution } from 'src/entities/contribution.entity';
import { ContributionComment } from 'src/entities/contributionComment.entity';

@Injectable()
export class SemesterService {
  constructor(
    @InjectRepository(Semester)
    private readonly semestersRepository: Repository<Semester>,
    private readonly entityManager: EntityManager,
  ) {}
  async getSemesters(params: GetSemesterParams) {
    const semesters = this.semestersRepository
      .createQueryBuilder('semester')
      .select(['semester'])
      .skip(params.skip)
      .take(params.take)
      .orderBy('semester.createdAt', Order.DESC);
    if (params.search) {
      semesters.andWhere('semester.semesterName ILIKE :semesterName', {
        semesterName: `%${params.search}%`,
      });
    }

    const [result, total] = await semesters.getManyAndCount();
    const pageMetaDto = new PageMetaDto({
      itemCount: total,
      pageOptionsDto: params,
    });
    return new ResponsePaginate(result, pageMetaDto, 'Success');
  }
  async getSemesterById(id: string) {
    const semester = await this.semestersRepository
      .createQueryBuilder('semester')
      .select(['semester'])
      .where('semester.id = :id', { id })
      .getOne();
    return semester;
  }
  async create(createSemesterDto: CreateSemesterDto) {
    const semester = new Semester(createSemesterDto);
    await this.entityManager.save(semester);
    return { semester, message: 'Successfully create semester' };
  }

  async update(id: string, updateSemesterDto: UpdateSemesterDto) {
    const semester = await this.semestersRepository.findOneBy({ id });
    if (semester) {
      semester.semesterName = updateSemesterDto.semesterName;
      semester.startDate = updateSemesterDto.startDate;
      semester.endDate = updateSemesterDto.endDate;

      await this.entityManager.save(semester);
      return { semester, message: 'Successfully update semester' };
    }
  }

  async remove(id: string) {
    const semester = await this.semestersRepository
      .createQueryBuilder('semester')
      .leftJoinAndSelect('semester.magazine', 'magazine')
      .where('semester.id = :id', { id })
      .getOne();

    if (!semester) {
      return { message: 'Semester not found' };
    }

    if (semester.magazine.length > 0) {
      for (const magazine of semester.magazine) {
        for (const contribution of magazine.contribution) {
          for (const contributionComment of contribution.contributionComment) {
            await this.entityManager.softDelete(
              ContributionComment,
              contributionComment.id,
            );
          }
          await this.entityManager.softDelete(Contribution, contribution.id);
        }
        await this.entityManager.softDelete(Magazine, magazine.id);
      }
    }
    await this.semestersRepository.softDelete(id);
    return { data: null, message: 'Semester deletion successful' };
  }
}
