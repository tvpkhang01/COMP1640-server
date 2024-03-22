import { AbstractEntity } from 'src/common/entities';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Magazine extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  ID: string;

  @Column()
  SemesterID: string;

  @Column()
  MagazineName: string;

  @Column()
  OpenDate: Date;

  @Column()
  CloseDate: Date;

  @Column()
  FinalCloseDate: Date;

  constructor(semester: Partial<Magazine>) {
    super();
    Object.assign(this, semester);
  }
}
