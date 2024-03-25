import { PageOptionsDto } from 'src/common/dtos/pageOption';
import { StatusEnum, TermEnum } from 'src/common/enum/enum';

export class GetContributionParams extends PageOptionsDto {
  Title: string;
  FilePaths: { Value: string }[];
  Status: StatusEnum;
  Term: TermEnum;
}
