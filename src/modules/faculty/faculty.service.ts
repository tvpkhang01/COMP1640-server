import { Injectable } from '@nestjs/common';
import { CreateFacultyDto } from './dto/create-faculty.dto';
import { UpdateFacultyDto } from './dto/update-faculty.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Faculty } from 'src/entities/faculty.entity';
import { EntityManager, Repository } from 'typeorm';
import { GetFacultyParams } from './dto/getList_faculty.dto';
import { Order } from 'src/common/enum/enum';
import { PageMetaDto } from 'src/common/dtos/pageMeta';
import { ResponsePaginate } from 'src/common/dtos/responsePaginate';

@Injectable()
export class FacultyService {
  constructor(
    @InjectRepository(Faculty)
    private readonly facultiesRepository: Repository<Faculty>,
    private readonly entityManager: EntityManager,
  ) {}

  async create(createFacultyDto: CreateFacultyDto) {
    const faculty = new Faculty(createFacultyDto);
    await this.entityManager.save(faculty);
    return { faculty, message: 'Successfully create user' };
  }

  async getFaculties(params: GetFacultyParams) {
    const faculties = this.facultiesRepository
      .createQueryBuilder('faculty')
      .select(['faculty', 'MCoordinator'])
      .leftJoin('faculty.MCoordinator', 'MCoordinator')
      .skip(params.skip)
      .take(params.take)
      .orderBy('faculty.createdAt', Order.DESC);
    if (params.search) {
      faculties.andWhere('faculty.name ILIKE :FacultyName', {
        name: `%${params.search}%`,
      });
    }
    const [result, total] = await faculties.getManyAndCount();
    const pageMetaDto = new PageMetaDto({
      itemCount: total,
      pageOptionsDto: params,
    });
    return new ResponsePaginate(result, pageMetaDto, 'Success');
  }

  async getFacultyById(ID: string) {
    const faculty = await this.facultiesRepository
      .createQueryBuilder('faculty')
      .select(['faculty', 'MCoordinator'])
      .leftJoin('faculty.MCoordinator', 'MCoordinator')
      .where('faculty.ID = :ID', { ID })
      .getOne();
    return faculty;
  }

  async update(ID: string, updateUserDto: UpdateFacultyDto) {
    const faculty = await this.facultiesRepository.findOneBy({ ID });
    if (faculty) {
      faculty.FacultyName = updateUserDto.FacultyName;
      await this.entityManager.save(faculty);
      return { faculty, message: 'Successfully update faculty' };
    }
  }

  async remove(ID: string) {
    const faculty = await this.facultiesRepository.findOneBy({ ID });
    if (!faculty) {
      return { message: 'Faculty not found' };
    }
    await this.facultiesRepository.softDelete(ID);
    return { data: null, message: 'Faculty deletion successful' };
  }
}
