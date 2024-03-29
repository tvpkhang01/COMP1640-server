import { Provider } from '@nestjs/common';
import { RoleEnum } from '../../../common/enum/enum';

export const adminRolesProvider: Provider = {
  provide: 'ADMIN_ROLES',
  useValue: [RoleEnum.ADMIN], // Vai trò của module admin
};

