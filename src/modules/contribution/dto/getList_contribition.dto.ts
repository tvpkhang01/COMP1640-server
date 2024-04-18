import { PageOptionsDto } from 'src/common/dtos/pageOption';
import { StatusEnum } from 'src/common/enum/enum';

export class GetContributionParams extends PageOptionsDto {
  title: string;
  filePaths: { value: string }[];
  status: StatusEnum[];
}
