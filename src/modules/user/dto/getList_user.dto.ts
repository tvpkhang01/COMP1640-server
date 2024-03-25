import { PageOptionsDto } from 'src/common/dtos/pageOption';
import { GenderEnum, RoleEnum } from 'src/common/enum/enum';

export class GetUserParams extends PageOptionsDto {
  userName: string;
  password: string;
  code: string;
  email: string;
  gender: GenderEnum;
  hone: string;
  dateOfBirth: Date;
  role: RoleEnum;
  facultyId: string;
  avatar: string;
}
