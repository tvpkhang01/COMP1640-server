import { IsNotEmpty } from 'class-validator';

export class CreateContributionCommentDto {
  @IsNotEmpty()
  contributionId: string;

  @IsNotEmpty()
  coordinatorId: string;

  @IsNotEmpty()
  comment: string;

  @IsNotEmpty()
  commentDate: Date;
}
