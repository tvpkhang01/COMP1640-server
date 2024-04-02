import { IsNotEmpty } from 'class-validator';
import { GenderEnum, RoleEnum } from 'src/common/enum/enum';

export class CreateUserDto {
  @IsNotEmpty()
  userName: string;

  @IsNotEmpty()
  code: string;

  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  gender: GenderEnum;

  @IsNotEmpty()
  phone: string;

  @IsNotEmpty()
  dateOfBirth: Date;

  role: RoleEnum;

  facultyId: string;
}
