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

      const user = await this.usersRepository.findOne({
        where: { id: createFacultyDto.coordinatorId },
      });
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

  async getFacultyUserStatistics(): Promise<any[]> {
    // Tạo một danh sách các faculty kèm theo thông tin về user (student) của mỗi faculty
    const faculties = await this.facultiesRepository.find({
      relations: ['student'],
    });

    // Duyệt qua mỗi faculty để tính tổng số và phần trăm của user trong mỗi faculty
    const facultyStatistics = faculties.map((faculty) => {
      // Tính tổng số user trong faculty hiện tại
      const totalUsers = faculty.student.length;
      // Tính phần trăm user trong faculty so với tổng số faculty
      const percentage =
        totalUsers > 0 ? (totalUsers / faculties.length) * 100 : 0;

      // Trả về thông tin về faculty cùng với tổng số và phần trăm của user
      return {
        facultyName: faculty.facultyName,
        totalUsers,
        percentage,
      };
    });

    // Trả về danh sách các faculty kèm theo thông tin tổng số và phần trăm của user trong mỗi faculty
    return facultyStatistics;
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

  async update(id: string, updateFacultyDto: UpdateFacultyDto) {
    try {
      const faculty = await this.facultiesRepository.findOneBy({ id });

      if (!faculty) {
        return { message: 'Faculty not found' };
      }

      if (faculty.coordinatorId !== updateFacultyDto.coordinatorId) {
        const oldCoordinatorId = faculty.coordinatorId;
        if (oldCoordinatorId) {
          const oldCoordinator = await this.usersRepository.findOne({
            where: { id: oldCoordinatorId },
          });
          if (oldCoordinator) {
            oldCoordinator.facultyId = null;
            await this.entityManager.save(oldCoordinator);
          }
        }

        const user = await this.usersRepository.findOne({
          where: { id: updateFacultyDto.coordinatorId },
        });
        if (user) {
          user.facultyId = faculty.id;
          await this.entityManager.save(user);
        }
      }

      faculty.facultyName = updateFacultyDto.facultyName;
      faculty.coordinatorId = updateFacultyDto.coordinatorId;
      const updatedFaculty = await this.entityManager.save(faculty);

      return {
        faculty: updatedFaculty,
        message: 'Successfully update faculty',
      };
    } catch (error) {
      throw error;
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
