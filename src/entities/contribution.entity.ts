import { AbstractEntity } from 'src/common/entities/abstract.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ContentTypeEnum, StatusEnum, TermEnum } from 'src/common/enum/enum';
// import { Faculty } from './faculty.entity';
import { User } from './user.entity';

@Entity()
export class Contribution extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  ID: string;

  @Column()
  Title: string;

  @Column({
    type: 'enum',
    enum: ContentTypeEnum,
    nullable: true,
  })
  ContentType: ContentTypeEnum;

  @Column({ nullable: true })
  FilePath: string;

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
  @ManyToOne(() => User, (user) => user.contribution)
  @JoinColumn({ name: 'studentId', referencedColumnName: 'ID' })
  Student: User;

  constructor(contribution: Partial<Contribution>) {
    super();
    Object.assign(this, contribution);
  }
}
