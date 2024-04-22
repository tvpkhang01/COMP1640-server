import { IsNotEmpty } from 'class-validator';

export class CreateFacultyDto {
  @IsNotEmpty()
  facultyName: string;

  coordinatorId: string;
}
