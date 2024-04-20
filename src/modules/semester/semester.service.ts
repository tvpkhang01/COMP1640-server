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
      return { message: 'Semmester not found' };
    }
    if (semester.magazine.length > 0) {
      for (const magazine of semester.magazine) {
        await this.entityManager.softDelete(Magazine, {
          id: magazine.id,
        });
      }
    }
    await this.semestersRepository.softDelete(id);
    return { data: null, message: 'Semester deletion successful' };
  }

  // update(ID: string, updateSemesterDto: UpdateSemesterDto) {
  //   return `This action updates a #${ID} semester`;
  // }

  // remove(ID: number) {
  //   return `This action removes a #${ID} semester`;
  // }
}
