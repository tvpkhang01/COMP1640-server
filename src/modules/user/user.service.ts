import { Injectable } from '@nestjs/common';

// import { UpdateUserDto } from './dto/update-user.dto';
import { User } from 'src/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Order } from 'src/common/constants/enum';
import { GetUserParams } from './dto/getList_user.dto';
import { PageMetaDto } from 'src/common/dtos/pageMeta';
import { ResponsePaginate } from 'src/common/dtos/responsePaginate';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly entityManager: EntityManager,
  ) {}

  async getUsers(params: GetUserParams) {
    const users = this.usersRepository
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

  async create(createUserDto: CreateUserDto) {
    const user = new User(createUserDto);
    await this.entityManager.save(user);
    return { user, message: 'Successfully create employee' };
  }
  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  // update(id: number, updateUserDto: UpdateUserDto) {
  //   return `This action updates a #${id} user`;
  // }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
