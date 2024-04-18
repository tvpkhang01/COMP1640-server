import { PageOptionsDto } from 'src/common/dtos/pageOption';

export class GetContributionCommentParams extends PageOptionsDto {
  contributionId: string;
  coordinatorId: string;
  comment: string;
}
