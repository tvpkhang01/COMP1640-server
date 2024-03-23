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
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUserParams } from './dto/getList_user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  async findAll(@Query() params: GetUserParams) {
    return this.userService.getUsers(params);
  }

  @Get(':ID')
  async findOne(@Param('ID') ID: string) {
    return this.userService.getUserById(ID);
  }

  @Patch(':ID')
  async update(
    @Param('ID') ID: string,
    @Body(new ValidationPipe()) updateUserDto: UpdateUserDto,
  ) {
    const result = await this.userService.update(ID, updateUserDto);
    return { result, message: 'Successfully update user' };
  }

  @Delete(':ID')
  async remove(@Param('ID') ID: string) {
    const result = await this.userService.remove(ID);
    if (result.message) {
      return { message: result.message };
    } else {
      return { data: result.data, message: 'Success' };
    }
  }
}
