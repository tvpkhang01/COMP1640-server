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
import { User } from 'src/entities/user.entity';

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
      .select(['faculty', 'mCoordinator'])
      .leftJoin('faculty.mCoordinator', 'mCoordinator')
      .skip(params.skip)
      .take(params.take)
      .orderBy('faculty.createdAt', Order.DESC);
    if (params.search) {
      faculties.andWhere('faculty.facultyName ILIKE :facultyName', {
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

  async getFacultyById(id: string) {
    const faculty = await this.facultiesRepository
      .createQueryBuilder('faculty')
      .select(['faculty', 'mCoordinator'])
      .leftJoin('faculty.mCoordinator', 'mCoordinator')
      .where('faculty.id = :id', { id })
      .getOne();
    return faculty;
  }

  async update(id: string, updateUserDto: UpdateFacultyDto) {
    const faculty = await this.facultiesRepository.findOneBy({ id });
    if (!faculty) {
      return { message: 'Faculty not found' };
    }
    if (faculty) {
      faculty.facultyName = updateUserDto.facultyName;
      await this.entityManager.save(faculty);
      return { faculty, message: 'Successfully update faculty' };
    }
  }

  async remove(id: string) {
    const faculty = await this.facultiesRepository
      .createQueryBuilder('faculty')
      .leftJoinAndSelect('faculty.student', 'student')
      .where('faculty.id = :id', { id })
      .getOne();
    if (!faculty) {
      return { message: 'Faculty not found' };
    }
    if (faculty.student.length > 0) {
      for (const student of faculty.student) {
        await this.entityManager.softDelete(User, { id: student.id });
      }
    }
    await this.facultiesRepository.softDelete(id);
    return { data: null, message: 'Faculty deletion successful' };
  }
}
