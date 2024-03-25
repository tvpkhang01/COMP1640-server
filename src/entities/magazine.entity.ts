import { AbstractEntity } from 'src/common/entities';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Semester } from './semester.entity';

@Entity()
export class Magazine extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  semesterId: string;

  @Column()
  magazineName: string;

  @Column()
  openDate: Date;

  @Column()
  closeDate: Date;

  @ManyToOne(() => Semester, (semester) => semester.magazine)
  @JoinColumn({ name: 'semesterId', referencedColumnName: 'id' })
  semester: Semester;

  constructor(magazine: Partial<Magazine>) {
    super();
    Object.assign(this, magazine);
  }
}
