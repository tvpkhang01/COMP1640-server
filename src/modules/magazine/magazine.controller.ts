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
import { MagazineService } from './magazine.service';
import { CreateMagazineDto } from './dto/create-magazine.dto';
import { UpdateMagazineDto } from './dto/update-magazine.dto';
import { GetMagazineParams } from './dto/getList-magazine.dto';

@Controller('magazine')
export class MagazineController {
  constructor(private readonly magazineService: MagazineService) {}

  @Post()
  async create(@Body() createMagazineDto: CreateMagazineDto) {
    return this.magazineService.create(createMagazineDto);
  }

  @Get()
  async findAll(@Query() params: GetMagazineParams) {
    return this.magazineService.getMagazines(params);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.magazineService.getMagazineById(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(new ValidationPipe()) updateMagazineDto: UpdateMagazineDto,
  ) {
    const result = await this.magazineService.update(id, updateMagazineDto);
    return { result, message: 'Successfully update magazine' };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.magazineService.remove(id);
    if (result.message) {
      return { message: result.message };
    } else {
      return;
    }
  }
}
