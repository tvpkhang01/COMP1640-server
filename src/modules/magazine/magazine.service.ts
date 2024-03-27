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
import { Contribution } from 'src/entities/contribution.entity';

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
      magazines.andWhere('project.name ILIKE :magazineName', {
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
        await this.entityManager.softDelete(Contribution, {
          id: contribution.id,
        });
      }
    }
    await this.magazinesRepository.softDelete(id);
    return { data: null, message: 'Magazine deletion successful' };
  }
  // update(ID: string, updateSemesterDto: UpdateSemesterDto) {
  //   return `This action updates a #${ID} semester`;
  // }

  // remove(ID: number) {
  //   return `This action removes a #${ID} semester`;
  // }
}