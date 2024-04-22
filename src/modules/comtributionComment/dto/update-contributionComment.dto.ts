import { PartialType } from '@nestjs/mapped-types';
import { CreateContributionCommentDto } from '../dto/create-contributionComment.dto';

export class UpdateContributionCommentDto extends PartialType(
  CreateContributionCommentDto,
) {}
