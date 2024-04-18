import { AbstractEntity } from '../common/entities/abstract.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Magazine } from './magazine.entity';

@Entity()
export class Semester extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  semesterName: string;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @OneToMany(() => Magazine, (magazine) => magazine.semester, {
    cascade: true,
    onUpdate: 'CASCADE',
  })
  magazine: Magazine[];

  constructor(semester: Partial<Semester>) {
    super();
    Object.assign(this, semester);
  }
}
