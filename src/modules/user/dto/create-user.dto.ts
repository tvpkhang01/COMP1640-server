import { IsNotEmpty } from 'class-validator';
import { GenderEnum, RoleEnum } from 'src/common/enum/enum';

export class CreateUserDto {
  @IsNotEmpty()
  UserName: string;

  @IsNotEmpty()
  Code: string;

  @IsNotEmpty()
  Email: string;

  @IsNotEmpty()
  Gender: GenderEnum;

  @IsNotEmpty()
  Phone: string;

  @IsNotEmpty()
  DateOfBirth: Date;

  Role: RoleEnum;

  facultyId: string;

  Avatar: string;
}
