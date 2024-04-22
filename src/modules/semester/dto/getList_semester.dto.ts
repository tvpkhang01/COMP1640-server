import { PageOptionsDto } from '../../../common/dtos/pageOption';

export class GetSemesterParams extends PageOptionsDto {
  semesterName: string;
  startDate: Date;
  endDate: Date;
}
