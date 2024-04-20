import { IsNotEmpty } from 'class-validator';
import { StatusEnum, TermEnum } from '../../../common/enum/enum';

export class CreateContributionDto {
  @IsNotEmpty()
  title: string;

  fileImage: { file: string }[];

  fileDocx: { file: string }[];

  status: StatusEnum;
  @IsNotEmpty()
  studentId: string;
}
