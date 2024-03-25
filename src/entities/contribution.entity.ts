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
  ID: string;

  @Column()
  Title: string;

  @Column('json')
  FilePaths: { Value: string }[];

  @Column({
    type: 'enum',
    enum: StatusEnum,
    default: StatusEnum.REJECT,
    nullable: false,
  })
  Status: StatusEnum;

  @Column({
    type: 'enum',
    enum: TermEnum,
    default: TermEnum.DISAGREE,
    nullable: false,
  })
  Term: TermEnum;

  // User/Student relationship
  @Column()
  studentId: string;
  @ManyToOne(() => User, (user) => user.Contribution)
  @JoinColumn({ name: 'studentId', referencedColumnName: 'ID' })
  Student: User;

  constructor(contribution: Partial<Contribution>) {
    super();
    Object.assign(this, contribution);
  }
}
