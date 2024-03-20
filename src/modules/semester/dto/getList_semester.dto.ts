import { PageOptionsDto } from 'src/common/dtos/pageOption';

export class GetSemesterParams extends PageOptionsDto {
  SemesterName: string;
  StartDate: Date;
  EndDate: Date;
}
