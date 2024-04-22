import { IsNotEmpty } from 'class-validator';

export class CreateMagazineDto {
  @IsNotEmpty()
  semesterId: string;

  @IsNotEmpty()
  magazineName: string;

  @IsNotEmpty()
  openDate: Date;

  @IsNotEmpty()
  closeDate: Date;
}
