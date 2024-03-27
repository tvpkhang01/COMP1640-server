import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Patch,
  ValidationPipe,
} from '@nestjs/common';
import { CreateContributionCommentDto } from './dto/create-contributionComment.dto';
import { ContributionCommentService } from './contributionComment.service';
import { GetContributionCommentParams } from './dto/getList-contributionComment.dto';
import { UpdateContributionCommentDto } from './dto/update-contributionComment.dto';

@Controller('contributionComment')
export class ContributionCommentController {
  constructor(
    private readonly contributionCommentService: ContributionCommentService,
  ) {}

  @Post()
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
}
