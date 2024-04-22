import { IsNotEmpty } from 'class-validator';
import { StatusEnum } from '../../../common/enum/enum';

export class CreateContributionDto {
  @IsNotEmpty()
  title: string;

  fileImage: { file: string }[];

  fileDocx: { file: string }[];

  status: StatusEnum;
  @IsNotEmpty()
  studentId: string;
}
