import { AbstractEntity } from 'src/common/entities/abstract.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { StatusEnum, TermEnum } from 'src/common/enum/enum';
import { User } from './user.entity';

@Entity()
export class Contribution extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('json')
  filePaths: { value: string }[];

  @Column({
    type: 'enum',
    enum: StatusEnum,
    default: StatusEnum.PENDING,
    nullable: false,
  })
  status: StatusEnum;

  @Column({
    type: 'enum',
    enum: TermEnum,
    default: TermEnum.DISAGREE,
    nullable: false,
  })
  term: TermEnum;

  // User/Student relationship
  @Column()
  studentId: string;
  @ManyToOne(() => User, (user) => user.contribution)
  @JoinColumn({ name: 'studentId', referencedColumnName: 'id' })
  student: User;

  constructor(contribution: Partial<Contribution>) {
    super();
    Object.assign(this, contribution);
  }
}
