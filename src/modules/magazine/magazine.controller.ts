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

  @Get(':ID')
  async findOne(@Param('ID') ID: string) {
    return this.magazineService.getMagazineById(ID);
  }

  @Patch(':ID')
  async update(
    @Param('ID') ID: string,
    @Body(new ValidationPipe()) updateMagazineDto: UpdateMagazineDto,
  ) {
    const result = await this.magazineService.update(ID, updateMagazineDto);
    return { result, message: 'Successfully update magazine' };
  }

  @Delete(':ID')
  async remove(@Param('ID') ID: string) {
    const result = await this.magazineService.remove(ID);
    if (result.message) {
      return { message: result.message };
    } else {
      return;
    }
  }
}
