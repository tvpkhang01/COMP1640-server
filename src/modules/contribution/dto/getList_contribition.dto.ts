import { PageOptionsDto } from 'src/common/dtos/pageOption';
import { StatusEnum, TermEnum } from 'src/common/enum/enum';

export class GetContributionParams extends PageOptionsDto {
  title: string;
  filePaths: { value: string }[];
  status: StatusEnum[];
}
