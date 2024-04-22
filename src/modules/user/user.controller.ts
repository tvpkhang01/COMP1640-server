import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  ValidationPipe,
  Patch,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  // UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUserParams } from './dto/getList_user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '../auth/utils/auth.guard';
import { RolesGuard } from '../auth/utils/role.middleware';
import { RoleEnum } from '../../common/enum/enum';
import { Multer } from 'multer';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @UseGuards(AuthGuard, new RolesGuard([RoleEnum.ADMIN]))
  @UseInterceptors(FileInterceptor('avatar'))
  async create(
    @Body() createUserDto: CreateUserDto,
    @UploadedFile() avatar?: Multer.File,
  ) {
    return this.userService.create(createUserDto, avatar);
  }

  @Get()
  // @UseGuards(AuthGuard, new RolesGuard([RoleEnum.MM, RoleEnum.MC]))
  async findAll(@Query() params: GetUserParams) {
    return this.userService.getUsers(params);
  }

  @Get('total')
  async getTotalUser(@Query('period') period: string) {
    return await this.userService.getTotalUser(period);
  }

  @Get(':id')
  async findOneById(@Param('id') id: string) {
    return this.userService.getUserById(id);
  }

  @Get(':userName')
  async findOneByUserName(@Param('id') userName: string) {
    return this.userService.findOne(userName);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  async update(
    @Param('id') id: string,
    @Body(new ValidationPipe()) updateUserDto: UpdateUserDto,
    @UploadedFile() avatar?: Multer.File,
  ) {
    const result = await this.userService.update(id, updateUserDto, avatar);
    return { result, message: 'Successfully update user' };
  }

  @Delete(':id')
  @UseGuards(AuthGuard, new RolesGuard([RoleEnum.ADMIN]))
  async remove(@Param('id') id: string) {
    const result = await this.userService.remove(id);
    if (result.message) {
      return { message: result.message };
    } else {
      return { data: result.data, message: 'Success' };
    }
  }
}
