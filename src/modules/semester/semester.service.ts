import { Injectable } from '@nestjs/common';
import { CreateSemesterDto } from './dto/create-semester.dto';
import { UpdateSemesterDto } from './dto/update-semester.dto';
import { Semester } from 'src/entities/semester.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { GetSemesterParams } from './dto/getList_semester.dto';
import { Order } from 'src/common/enum/enum';
import { PageMetaDto } from 'src/common/dtos/pageMeta';
import { ResponsePaginate } from 'src/common/dtos/responsePaginate';

@Injectable()
export class SemesterService {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getSemesterById(ID: string) {
    throw new Error('Method not implemented.');
  }
  constructor(
    @InjectRepository(Semester)
    private readonly semestersRepository: Repository<Semester>,
    private readonly entityManager: EntityManager,
  ) {}
  async getSemesters(params: GetSemesterParams) {
    const users = this.semestersRepository
      .createQueryBuilder('user')
      .select(['user'])
      .skip(params.skip)
      .take(params.take)
      .orderBy('user.createdAt', Order.DESC);
    if (params.search) {
      users.andWhere('project.name ILIKE :UserName', {
        name: `%${params.search}%`,
      });
    }

    const [result, total] = await users.getManyAndCount();
    const pageMetaDto = new PageMetaDto({
      itemCount: total,
      pageOptionsDto: params,
    });
    return new ResponsePaginate(result, pageMetaDto, 'Success');
  }
  async create(createSemesterDto: CreateSemesterDto) {
    const semester = new Semester(createSemesterDto);
    await this.entityManager.save(semester);
    return { semester, message: 'Successfully create semester' };
  }

  async update(ID: string, updateSemesterDto: UpdateSemesterDto) {
    const semester = await this.semestersRepository.findOneBy({ ID });
    if (semester) {
      semester.SemesterName = updateSemesterDto.SemesterName;
      semester.StartDate = updateSemesterDto.StartDate;
      semester.EndDate = updateSemesterDto.EndDate;

      await this.entityManager.save(semester);
      return { semester, message: 'Successfully update semester' };
    }
  }

  async remove(ID: string) {
    const semester = await this.semestersRepository.findOneBy({ ID });
    if (!semester) {
      return { message: 'semester not found' };
    }
    await this.semestersRepository.softDelete(ID);
    return { data: null, message: 'Semester deletion successful' };
  }

  findAll() {
    return `This action returns all semester`;
  }

  findOne(ID: number) {
    return `This action returns a #${ID} semester`;
  }

  // update(ID: string, updateSemesterDto: UpdateSemesterDto) {
  //   return `This action updates a #${ID} semester`;
  // }

  // remove(ID: number) {
  //   return `This action removes a #${ID} semester`;
  // }
}
