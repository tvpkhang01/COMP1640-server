import { PageOptionsDto } from '../../../common/dtos/pageOption';

export class GetContributionCommentParams extends PageOptionsDto {
  contributionId: string;
  coordinatorId: string;
  comment: string;
}
