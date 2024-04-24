import { Injectable } from '@nestjs/common';
import { User } from '../../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Order } from '../../common/constants/enum';
import { GetUserParams } from './dto/getList_user.dto';
import { PageMetaDto } from '../../common/dtos/pageMeta';
import { ResponsePaginate } from '../../common/dtos/responsePaginate';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Contribution } from '../../entities/contribution.entity';
import { ContributionComment } from '../../entities/contributionComment.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Multer } from 'multer';
import { RoleEnum } from '../../common/enum/enum';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly entityManager: EntityManager,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(createUserDto: CreateUserDto, avatar?: Multer.File) {
    const user = new User(createUserDto);

    if (avatar) {
      const avatarUrl = await this.uploadAndReturnUrl(avatar);
      user.avatar = avatarUrl;
    }
    await this.entityManager.save(user);
    return { user, message: 'Successfully create user' };
  }

  async getUsers(params: GetUserParams) {
    const users = this.usersRepository
      .createQueryBuilder('user')
      .select(['user', 'faculty'])
      .leftJoin('user.faculty', 'faculty')
      .andWhere('user.role = ANY(:role)', {
        role: params.role
          ? [params.role]
          : [RoleEnum.ADMIN, RoleEnum.MM, RoleEnum.MC, RoleEnum.STUDENT],
      })
      .skip(params.skip)
      .take(params.take)
      .orderBy('user.createdAt', Order.DESC);
    if (params.searchByUserName) {
      users.andWhere('user.userName ILIKE :userName', {
        userName: `%${params.searchByUserName}%`,
      });
    }
    const [result, total] = await users.getManyAndCount();
    const pageMetaDto = new PageMetaDto({
      itemCount: total,
      pageOptionsDto: params,
    });
    return new ResponsePaginate(result, pageMetaDto, 'Success');
  }

  async getTotalUser(period: string) {
    const total = await this.usersRepository.count();

    const pastYear = new Date();
    pastYear.setFullYear(pastYear.getFullYear() - 1);

    let oldCount, currentCount;

    if (period === 'year') {
      oldCount = await this.usersRepository
        .createQueryBuilder('user')
        .where('EXTRACT(YEAR FROM user.createdAt) = :pastYear', {
          pastYear: pastYear.getFullYear(),
        })
        .getCount();

      currentCount = await this.usersRepository
        .createQueryBuilder('user')
        .where('EXTRACT(YEAR FROM user.createdAt) = :currentYear', {
          currentYear: new Date().getFullYear(),
        })
        .getCount();
    } else if (period === 'month') {
      const currentMonth = new Date().getMonth() + 1;
      const pastMonth = currentMonth - 1 === 0 ? 12 : currentMonth - 1;
      const currentYear = new Date().getFullYear();
      const pastYear = currentMonth - 1 === 0 ? currentYear - 1 : currentYear;

      oldCount = await this.usersRepository
        .createQueryBuilder('user')
        .where('EXTRACT(YEAR FROM user.createdAt) = :pastYear', {
          pastYear: pastYear,
        })
        .andWhere('EXTRACT(MONTH FROM user.createdAt) = :pastMonth', {
          pastMonth: pastMonth,
        })
        .getCount();

      currentCount = await this.usersRepository
        .createQueryBuilder('user')
        .where('EXTRACT(YEAR FROM user.createdAt) = :currentYear', {
          currentYear: currentYear,
        })
        .andWhere('EXTRACT(MONTH FROM user.createdAt) = :currentMonth', {
          currentMonth: currentMonth,
        })
        .getCount();
    }

    const percentageUserChange =
      oldCount === 0 ? 100 : ((currentCount - oldCount) / oldCount) * 100;

    return {
      total,
      oldCount,
      currentCount,
      percentageUserChange,
    };
  }

  async getUserById(id: string) {
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .select(['user', 'faculty', 'contribution'])
      .leftJoin('user.faculty', 'faculty')
      .leftJoin('user.contribution', 'contribution')
      .where('user.id = :id', { id })
      .getOne();
    return user;
  }

  async findOne(userName: string): Promise<User | undefined> {
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .select(['user', 'faculty.facultyName'])
      .leftJoin('user.faculty', 'faculty')
      .where('user.userName = :userName', { userName })
      .getOne();
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto, avatar?: Multer.File) {
    try {
      const user = await this.usersRepository.findOneBy({ id });
      if (!user) {
        return { message: 'User not found' };
      }
      console.log('ava', avatar);
      if (avatar) {
        await this.deleteOldAvatar(user);
        user.avatar = await this.uploadAndReturnUrl(avatar);
      }
      user.userName = updateUserDto.userName;
      user.password = updateUserDto.password;
      user.email = updateUserDto.email;
      user.phone = updateUserDto.phone;
      user.dateOfBirth = updateUserDto.dateOfBirth;
      user.gender = updateUserDto.gender;
      user.role = updateUserDto.role;
      user.facultyId = updateUserDto.facultyId;

      await this.entityManager.save(user);
    } catch (error) {
      throw error;
    }
  }

  async remove(id: string) {
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.contribution', 'contribution')
      .leftJoinAndSelect('user.contributionComment', 'contributionComment')
      .where('user.id = :id', { id })
      .getOne();
    if (!user) {
      return { message: 'User not found' };
    }
    if (user.contribution && user.contribution.length > 0) {
      for (const contribution of user.contribution) {
        await this.entityManager.softDelete(Contribution, {
          id: contribution.id,
        });
      }
    }
    if (user.contributionComment && user.contributionComment.length > 0) {
      for (const contributionComment of user.contributionComment) {
        await this.entityManager.softDelete(ContributionComment, {
          id: contributionComment.id,
        });
      }
    }
    await this.usersRepository.softDelete(id);
    return { data: null, message: 'User deletion successful' };
  }

  async deleteOldAvatar(user: User): Promise<void> {
    if (user.avatar) {
      const publicId = this.cloudinaryService.extractPublicIdFromUrl(
        user.avatar,
      );
      await this.cloudinaryService.deleteFile(publicId);
    }
  }

  async uploadAndReturnUrl(file: Multer.File): Promise<string> {
    try {
      const result = await this.cloudinaryService.uploadImageFile(file);
      return result.secure_url;
    } catch (error) {
      console.error('Error uploading image to Cloudinary:', error);
      throw error;
    }
  }
}
