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
import { ContributionService } from './contribution.service';
import { CreateContributionDto } from './dto/create-contribution.dto';
import { UpdateContributionDto } from './dto/update-contribution.dto';
import { GetContributionParams } from './dto/getList_contribition.dto';

@Controller('contribution')
export class ContributionController {
  constructor(private readonly contributionService: ContributionService) {}

  @Post()
  async create(@Body() createContributionDto: CreateContributionDto) {
    return this.contributionService.create(createContributionDto);
  }

  @Get()
  async findAll(@Query() params: GetContributionParams) {
    return this.contributionService.getContributions(params);
  }

  @Get(':ID')
  async findOne(@Param('ID') ID: string) {
    return this.contributionService.getContributionById(ID);
  }

  @Patch(':ID')
  async update(
    @Param('ID') ID: string,
    @Body(new ValidationPipe()) updatecontributionDto: UpdateContributionDto,
  ) {
    const result = await this.contributionService.update(
      ID,
      updatecontributionDto,
    );
    return { result, message: 'Successfully update contribituon' };
  }

  @Delete(':ID')
  async remove(@Param('ID') ID: string) {
    const result = await this.contributionService.remove(ID);
    if (result.message) {
      return { message: result.message };
    } else {
      return { data: result.data, message: 'Success' };
    }
  }
}
