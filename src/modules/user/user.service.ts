import { Injectable } from '@nestjs/common';
import { User } from 'src/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Order } from 'src/common/constants/enum';
import { GetUserParams } from './dto/getList_user.dto';
import { PageMetaDto } from 'src/common/dtos/pageMeta';
import { ResponsePaginate } from 'src/common/dtos/responsePaginate';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Contribution } from 'src/entities/contribution.entity';
import { ContributionComment } from 'src/entities/contributionComment.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Multer } from 'multer';

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
      .select(['user', 'faculty.facultyName'])
      .leftJoin('user.faculty', 'faculty')
      .skip(params.skip)
      .take(params.take)
      .orderBy('user.createdAt', Order.DESC);
    if (params.search) {
      users.andWhere('user.userName ILIKE :userName', {
        userName: `%${params.search}%`,
      });
    }
    const [result, total] = await users.getManyAndCount();
    const pageMetaDto = new PageMetaDto({
      itemCount: total,
      pageOptionsDto: params,
    });
    return new ResponsePaginate(result, pageMetaDto, 'Success');
  }

  async getUserById(id: string) {
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .select(['user', 'faculty.facultyName'])
      .leftJoin('user.faculty', 'faculty')
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
    if (user.contribution.length > 0) {
      for (const contribution of user.contribution) {
        await this.entityManager.softDelete(Contribution, {
          id: contribution.id,
        });
      }
    }
    if (user.contributionComment.length > 0) {
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

  private async uploadAndReturnUrl(file: Multer.File): Promise<string> {
    try {
      const result = await this.cloudinaryService.uploadImageFile(file);
      return result.secure_url;
    } catch (error) {
      console.error('Error uploading image to Cloudinary:', error);
      throw error;
    }
  }
}
