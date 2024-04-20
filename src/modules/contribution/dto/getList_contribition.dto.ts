import { PageOptionsDto } from '../../../common/dtos/pageOption';
import { StatusEnum, TermEnum } from '../../../common/enum/enum';

export class GetContributionParams extends PageOptionsDto {
  title: string;
  filePaths: { value: string }[];
  status: StatusEnum[];
}
