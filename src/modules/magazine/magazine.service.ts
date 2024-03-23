import { Injectable } from '@nestjs/common';
import { CreateMagazineDto } from './dto/create-magazine.dto';
import { UpdateMagazineDto } from './dto/update-magazine.dto';
import { GetMagazineParams } from './dto/getList-magazine.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Order } from 'src/common/enum/enum';
import { PageMetaDto } from 'src/common/dtos/pageMeta';
import { ResponsePaginate } from 'src/common/dtos/responsePaginate';
import { Magazine } from 'src/entities/magazine.entity';

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
      .select(['magazine'])
      .skip(params.skip)
      .take(params.take)
      .orderBy('magazine.createdAt', Order.DESC);
    if (params.search) {
      magazines.andWhere('project.name ILIKE :MagazineName', {
        name: `%${params.search}%`,
      });
    }

    const [result, total] = await magazines.getManyAndCount();
    const pageMetaDto = new PageMetaDto({
      itemCount: total,
      pageOptionsDto: params,
    });
    return new ResponsePaginate(result, pageMetaDto, 'Success');
  }
  async getMagazineById(ID: string) {
    const magazine = await this.magazinesRepository
      .createQueryBuilder('magazine')
      .select(['magazine'])
      .where('magazine.ID = :ID', { ID })
      .getOne();
    return magazine;
  }
  async create(createMagazineDto: CreateMagazineDto) {
    const magazine = new Magazine(createMagazineDto);
    await this.entityManager.save(magazine);
    return { magazine, message: 'Successfully create magazine' };
  }

  async update(ID: string, updateMagazineDto: UpdateMagazineDto) {
    const magazine = await this.magazinesRepository.findOneBy({ ID });
    if (magazine) {
      magazine.SemesterID = updateMagazineDto.SemesterID;
      magazine.MagazineName = updateMagazineDto.MagazineName;
      magazine.OpenDate = updateMagazineDto.OpenDate;
      magazine.CloseDate = updateMagazineDto.CloseDate;

      await this.entityManager.save(magazine);
      return { magazine, message: 'Successfully update magazine' };
    }
  }

  async remove(ID: string) {
    const magazine = await this.magazinesRepository.findOneBy({ ID });
    if (!magazine) {
      return { message: 'magazine not found' };
    }
    await this.magazinesRepository.softDelete(ID);
    return { data: null, message: 'Magazine deletion successful' };
  }

  // update(ID: string, updateSemesterDto: UpdateSemesterDto) {
  //   return `This action updates a #${ID} semester`;
  // }

  // remove(ID: number) {
  //   return `This action removes a #${ID} semester`;
  // }
}
