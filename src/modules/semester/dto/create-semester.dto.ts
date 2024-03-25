import { IsNotEmpty } from 'class-validator';

export class CreateSemesterDto {
  @IsNotEmpty()
  semesterName: string;

  @IsNotEmpty()
  startDate: Date;

  @IsNotEmpty()
  endDate: Date;
}
