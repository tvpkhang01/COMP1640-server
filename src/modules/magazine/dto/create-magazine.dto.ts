import { IsNotEmpty } from 'class-validator';

export class CreateMagazineDto {
  @IsNotEmpty()
  SemesterID: string;

  @IsNotEmpty()
  MagazineName: string;

  @IsNotEmpty()
  OpenDate: Date;

  @IsNotEmpty()
  CloseDate: Date;
}
