import { AbstractEntity } from 'src/common/entities/abstract.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { StatusEnum, TermEnum } from 'src/common/enum/enum';
import { User } from './user.entity';
import { Magazine } from './magazine.entity';
import { ContributionComment } from './contributionComment.entity';

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
    default: StatusEnum.REJECT,
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

  //relationship contribution with magazine ManyToOne
  @Column()
  magazineId: string;
  @ManyToOne(() => Magazine, (magazine) => magazine.contribution)
  @JoinColumn({ name: 'magazineId', referencedColumnName: 'id' })
  magazine: Magazine;

  //contribution with contributionComment
  @OneToMany(
    () => ContributionComment,
    (contributionComment) => contributionComment.contribution,
    {
      cascade: true,
      onUpdate: 'CASCADE',
    },
  )
  contributionComment: ContributionComment[];

  constructor(contribution: Partial<Contribution>) {
    super();
    Object.assign(this, contribution);
  }
}
