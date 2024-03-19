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

  @Get(':ID')
  findOne(@Param('ID') ID: string) {
    return this.semesterService.findOne(+ID);
  }

  @Patch(':ID')
  async update(
    @Param('ID') ID: string,
    @Body(new ValidationPipe()) updateSemesterDto: UpdateSemesterDto,
  ) {
    const result = await this.semesterService.update(ID, updateSemesterDto);
    return { result, message: 'Successfully update user' };
  }

  @Delete(':ID')
  async remove(@Param('ID') ID: string) {
    const result = await this.semesterService.remove(ID);
    if (result.message) {
      return { message: result.message };
    } else {
      return;
    }
  }
}
