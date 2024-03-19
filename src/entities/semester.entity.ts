import { AbstractEntity } from 'src/common/entities';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Semester extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  ID: string;

  @Column()
  SemesterName: string;

  @Column()
  StartDate: Date;

  @Column()
  EndDate: Date;

  constructor(semester: Partial<Semester>) {
    super();
    Object.assign(this, semester);
  }
}
