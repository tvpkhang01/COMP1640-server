import { IsNotEmpty } from 'class-validator';

export class CreateSemesterDto {
  @IsNotEmpty()
  SemesterName: string;

  @IsNotEmpty()
  StartDate: Date;

  @IsNotEmpty()
  EndDate: Date;
}
