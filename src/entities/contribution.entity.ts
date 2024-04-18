import { AbstractEntity } from '../common/entities/abstract.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { StatusEnum, TermEnum } from '../common/enum/enum';
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
  fileImage: { file: string }[];

  @Column('json')
  fileDocx: { file: string }[];

  @Column('json', {nullable: true})
  fileTitle: { file: string }[];

  @Column({
    type: 'enum',
    enum: StatusEnum,
    default: StatusEnum.PENDING,
    nullable: false,
  })
  status: StatusEnum;

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
