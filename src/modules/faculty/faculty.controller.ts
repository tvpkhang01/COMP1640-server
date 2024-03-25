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
} from '@nestjs/common';
import { FacultyService } from './faculty.service';
import { CreateFacultyDto } from './dto/create-faculty.dto';
import { UpdateFacultyDto } from './dto/update-faculty.dto';
import { GetFacultyParams } from './dto/getList_faculty.dto';

@Controller('faculty')
export class FacultyController {
  constructor(private readonly facultyService: FacultyService) {}

  @Post()
  async create(@Body() createFacultyDto: CreateFacultyDto) {
    return this.facultyService.create(createFacultyDto);
  }

  @Get()
  async findAll(@Query() params: GetFacultyParams) {
    return this.facultyService.getFaculties(params);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.facultyService.getFacultyById(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(new ValidationPipe()) updateFacultyDto: UpdateFacultyDto,
  ) {
    const result = await this.facultyService.update(id, updateFacultyDto);
    return { result, message: 'Successfully update faculty' };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.facultyService.remove(id);
    if (result.message) {
      return { message: result.message };
    } else {
      return { data: result.data, message: 'Success' };
    }
  }
}
