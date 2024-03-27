import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { CreateContributionCommentDto } from './dto/create-contributionComment.dto';
import { ContributionCommentService } from './contributionComment.service';
import { GetContributionCommentParams } from './dto/getList-contributionComment.dto';

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
}
