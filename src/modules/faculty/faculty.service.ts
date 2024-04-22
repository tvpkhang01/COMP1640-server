import { Injectable } from '@nestjs/common';
import { CreateFacultyDto } from './dto/create-faculty.dto';
import { UpdateFacultyDto } from './dto/update-faculty.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Faculty } from '../../entities/faculty.entity';
import { EntityManager, Repository } from 'typeorm';
import { GetFacultyParams } from './dto/getList_faculty.dto';
import { Order } from '../../common/enum/enum';
import { PageMetaDto } from '../../common/dtos/pageMeta';
import { ResponsePaginate } from '../../common/dtos/responsePaginate';
import { User } from '../../entities/user.entity';

@Injectable()
export class FacultyService {
  constructor(
    @InjectRepository(Faculty)
    private readonly facultiesRepository: Repository<Faculty>,
    private readonly entityManager: EntityManager,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(createFacultyDto: CreateFacultyDto) {
    try {
        const faculty = new Faculty(createFacultyDto);
        const savedFaculty = await this.entityManager.save(faculty);
        
        const user = await this.usersRepository.findOne({ where: { id: createFacultyDto.coordinatorId } });
        if (user) {
            user.facultyId = savedFaculty.id;
            await this.entityManager.save(user);
        }

        return { faculty: savedFaculty, message: 'Successfully create faculty' };
    } catch (error) {
        throw error;
    }
}


  async getFaculties(params: GetFacultyParams) {
    const faculties = this.facultiesRepository
      .createQueryBuilder('faculty')
      .select(['faculty', 'coordinator'])
      .leftJoin('faculty.coordinator', 'coordinator')
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
      .select(['faculty', 'coordinator'])
      .leftJoin('faculty.coordinator', 'coordinator')
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
      faculty.coordinatorId = updateUserDto.coordinatorId;
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
