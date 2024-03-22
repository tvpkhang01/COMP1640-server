import { PageOptionsDto } from 'src/common/dtos/pageOption';

export class GetMagazineParams extends PageOptionsDto {
  SemesterID: string;
  MagazineName: string;
  OpenDate: Date;
  CloseDate: Date;
  FinalCloseDate: Date;
}
