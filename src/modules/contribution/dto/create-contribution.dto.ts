import { IsNotEmpty } from 'class-validator';
import { StatusEnum, TermEnum } from 'src/common/enum/enum';

export class CreateContributionDto {
  @IsNotEmpty()
  Title: string;

  FilePaths: { Value: string }[];

  Status: StatusEnum;

  Term: TermEnum;
}
