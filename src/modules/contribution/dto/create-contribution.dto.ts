import { IsNotEmpty } from 'class-validator';
import { StatusEnum, TermEnum } from 'src/common/enum/enum';

export class CreateContributionDto {
  @IsNotEmpty()
  title: string;

  fileImage: { file: string }[];

  fileDocx: { file: string }[];

  status: StatusEnum;
}
