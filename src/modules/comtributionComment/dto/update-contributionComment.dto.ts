import { PartialType } from '@nestjs/mapped-types';
import { CreateContributionCommentDto } from './create-ContributionComment.dto';

export class UpdateContributionCommentDto extends PartialType(
  CreateContributionCommentDto,
) {}
