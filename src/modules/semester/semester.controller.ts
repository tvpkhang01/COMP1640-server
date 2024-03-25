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
import { SemesterService } from './semester.service';
import { CreateSemesterDto } from './dto/create-semester.dto';
import { UpdateSemesterDto } from './dto/update-semester.dto';
import { GetSemesterParams } from './dto/getList_semester.dto';

@Controller('semester')
export class SemesterController {
  constructor(private readonly semesterService: SemesterService) {}

  @Post()
  async create(@Body() createUserDto: CreateSemesterDto) {
    return this.semesterService.create(createUserDto);
  }

  @Get()
  async findAll(@Query() params: GetSemesterParams) {
    return this.semesterService.getSemesters(params);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.semesterService.getSemesterById(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(new ValidationPipe()) updateSemesterDto: UpdateSemesterDto,
  ) {
    const result = await this.semesterService.update(id, updateSemesterDto);
    return { result, message: 'Successfully update user' };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.semesterService.remove(id);
    if (result.message) {
      return { message: result.message };
    } else {
      return;
    }
  }
}
