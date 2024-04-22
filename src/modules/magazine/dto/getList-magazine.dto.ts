import { PageOptionsDto } from '../../../common/dtos/pageOption';

export class GetMagazineParams extends PageOptionsDto {
  semesterId: string;
  magazineName: string;
  openDate: Date;
  closeDate: Date;
  finalCloseDate: Date;
}
