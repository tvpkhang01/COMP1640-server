import { PageOptionsDto } from 'src/common/dtos/pageOption';

export class GetSemesterParams extends PageOptionsDto {
  SemesterID: string;
  SemesterName: string;
  StartDate: Date;
  EndDate: Date;
}
