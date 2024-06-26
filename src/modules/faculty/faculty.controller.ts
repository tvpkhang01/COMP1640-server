import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { FacultyService } from './faculty.service';
import { CreateFacultyDto } from './dto/create-faculty.dto';
import { UpdateFacultyDto } from './dto/update-faculty.dto';
import { GetFacultyParams } from './dto/getList_faculty.dto';
import { AuthGuard } from '../auth/utils/auth.guard';
import { RolesGuard } from '../auth/utils/role.middleware';
import { RoleEnum } from '../../common/enum/enum';

@Controller('faculty')
export class FacultyController {
  constructor(private readonly facultyService: FacultyService) {}

  @Post()
  @UseGuards(AuthGuard, new RolesGuard([RoleEnum.MC, RoleEnum.ADMIN]))
  async create(@Body() createFacultyDto: CreateFacultyDto) {
    return this.facultyService.create(createFacultyDto);
  }

  @Get()
  async findAll(@Query() params: GetFacultyParams) {
    return this.facultyService.getFaculties(params);
  }

  @Get('/user-statistics')
  async getFacultyUserStatistics(): Promise<any[]> {
    // Gọi phương thức trong FacultyService để lấy thông tin về tổng số và phần trăm của user trong mỗi faculty
    return await this.facultyService.getFacultyUserStatistics();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.facultyService.getFacultyById(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, new RolesGuard([RoleEnum.MC, RoleEnum.ADMIN]))
  async update(
    @Param('id') id: string,
    @Body(new ValidationPipe()) updateFacultyDto: UpdateFacultyDto,
  ) {
    const result = await this.facultyService.update(id, updateFacultyDto);
    return { result, message: 'Successfully update faculty' };
  }

  @Delete(':id')
  @UseGuards(AuthGuard, new RolesGuard([RoleEnum.MC, RoleEnum.ADMIN]))
  async remove(@Param('id') id: string) {
    const result = await this.facultyService.remove(id);
    if (result.message) {
      return { message: result.message };
    } else {
      return { data: result.data, message: 'Success' };
    }
  }
}
