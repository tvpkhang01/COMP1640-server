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
  // UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUserParams } from './dto/getList_user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
// import { AuthGuard } from '../auth/utils/auth.guard';
// import { RolesGuard } from '../auth/utils/role.middleware';
// import { RoleEnum } from 'src/common/enum/enum';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  // @UseGuards(AuthGuard, new RolesGuard([RoleEnum.MM, RoleEnum.MC]))
  async findAll(@Query() params: GetUserParams) {
    return this.userService.getUsers(params);
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
  async update(
    @Param('id') id: string,
    @Body(new ValidationPipe()) updateUserDto: UpdateUserDto,
  ) {
    const result = await this.userService.update(id, updateUserDto);
    return { result, message: 'Successfully update user' };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.userService.remove(id);
    if (result.message) {
      return { message: result.message };
    } else {
      return { data: result.data, message: 'Success' };
    }
  }
}
