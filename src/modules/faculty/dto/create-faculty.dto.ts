import { IsNotEmpty } from 'class-validator';

export class CreateFacultyDto {
  @IsNotEmpty()
  FacultyName: string;

  mCoordinatorID: string;
}
