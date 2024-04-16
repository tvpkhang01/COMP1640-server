import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Patch,
  ValidationPipe,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CreateContributionCommentDto } from './dto/create-contributionComment.dto';
import { ContributionCommentService } from './contributionComment.service';
import { GetContributionCommentParams } from './dto/getList-contributionComment.dto';
import { UpdateContributionCommentDto } from './dto/update-contributionComment.dto';
import { AuthGuard } from '../auth/utils/auth.guard';
import { RolesGuard } from '../auth/utils/role.middleware';
import { RoleEnum } from 'src/common/enum/enum';

@Controller('contributionComment')
export class ContributionCommentController {
  constructor(
    private readonly contributionCommentService: ContributionCommentService,
  ) {}

  @Post()
  @UseGuards(AuthGuard, new RolesGuard([RoleEnum.MC]))
  async create(
    @Body() createContributionCommentDto: CreateContributionCommentDto,
  ) {
    return this.contributionCommentService.create(createContributionCommentDto);
  }

  @Get()
  async findAll(@Query() params: GetContributionCommentParams) {
    return this.contributionCommentService.getContributionComments(params);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.contributionCommentService.getContributionCommentById(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, new RolesGuard([RoleEnum.MC]))
  async update(
    @Param('id') id: string,
    @Body(new ValidationPipe())
    updateContributionCommentDto: UpdateContributionCommentDto,
  ) {
    const result = await this.contributionCommentService.update(
      id,
      updateContributionCommentDto,
    );
    return { result, message: 'Successfully update comment' };
  }

  @Delete(':id')
  @UseGuards(AuthGuard, new RolesGuard([RoleEnum.MC]))
  async remove(@Param('id') id: string) {
    const result = await this.contributionCommentService.remove(id);
    if (result.message) {
      return { message: result.message };
    } else {
      return;
    }
  }
}
