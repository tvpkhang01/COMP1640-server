import { PageOptionsDto } from 'src/common/dtos/pageOption';
import { GenderEnum, RoleEnum } from 'src/common/enum/enum';

export class GetUserParams extends PageOptionsDto {
  UserName: string;
  Code: string;
  Email: string;
  Gender: GenderEnum;
  Phone: string;
  DateOfBirth: Date;
  Role: RoleEnum;
  Faculty: string;
  Avatar: string;
}
