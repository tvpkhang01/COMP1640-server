import { IsNotEmpty } from 'class-validator';
import { StatusEnum, TermEnum } from 'src/common/enum/enum';

export class CreateContributionDto {
  @IsNotEmpty()
  title: string;

  filePaths: { value: string }[];

  status: StatusEnum;

  term: TermEnum;
}
