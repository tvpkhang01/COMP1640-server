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

  @Get(':ID')
  async findOne(@Param('ID') ID: string) {
    return this.facultyService.getFacultyById(ID);
  }

  @Patch(':ID')
  async update(
    @Param('ID') ID: string,
    @Body(new ValidationPipe()) updateFacultyDto: UpdateFacultyDto,
  ) {
    const result = await this.facultyService.update(ID, updateFacultyDto);
    return { result, message: 'Successfully update faculty' };
  }

  @Delete(':ID')
  async remove(@Param('ID') ID: string) {
    const result = await this.facultyService.remove(ID);
    if (result.message) {
      return { message: result.message };
    } else {
      return { data: result.data, message: 'Success' };
    }
  }
}
