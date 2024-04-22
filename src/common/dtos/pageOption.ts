import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Order } from '../enum/enum';

export class PageOptionsDto {
  @IsString()
  search?: string = '';

  @IsString()
  searchByTitle?: string = '';

  @IsString()
  searchByUserName?: string = '';

  @IsString()
  facultyId?: string = '';

  @IsString()
  magazineId?: string = '';

  @IsString()
  semesterId?: string = '';

  @IsString()
  userId?: string = '';

  @IsString()
  fileImage?: string = '';

  @IsString()
  fileDocx?: string = '';

  @IsEnum(Order)
  @IsOptional()
  order?: Order = Order.DESC;

  orderBy?: string = 'id';

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  take?: number = 10;

  get skip(): number {
    return (this.page - 1) * this.take;
  }
}
