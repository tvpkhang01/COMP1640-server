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
import { UpdateUserDto } from './dto/update-user.dto';

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
    return { user, message: 'Successfully create user' };
  }

  async getUserById(ID: string) {
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .select(['user'])
      .where('user.ID = :ID', { ID })
      .getOne();
    return user;
  }

  async update(ID: string, updateUserDto: UpdateUserDto) {
    const user = await this.usersRepository.findOneBy({ ID });
    if (user) {
      user.UserName = updateUserDto.UserName;
      user.Email = updateUserDto.Email;
      user.Phone = updateUserDto.Phone;
      user.Avatar = updateUserDto.Avatar;
      await this.entityManager.save(user);
      return { user, message: 'Successfully update user' };
    }
  }

  // remove(id: number) {
  //   return `This action removes a #${id} user`;
  // }

  async remove(ID: string) {
    const user = await this.usersRepository.findOneBy({ ID });
    if (!user) {
      return { message: 'User not found' };
    }
    await this.usersRepository.softDelete(ID);
    return { data: null, message: 'User deletion successful' };
  }
}
