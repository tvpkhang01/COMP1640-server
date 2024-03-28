import { AbstractEntity } from 'src/common/entities';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Contribution } from './contribution.entity';
import { User } from './user.entity';

@Entity()
export class ContributionComment extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  contributionId: string;

  @Column()
  coordinatorId: string;

  @Column()
  comment: string;

  @Column()
  commentDate: Date;

  //many to one contribution with contributionComment
  @ManyToOne(
    () => Contribution,
    (contribution) => contribution.contributionComment,
  )
  @JoinColumn({ name: 'commentId', referencedColumnName: 'id' })
  contribution: Contribution;

  //User/Coordinator relationship
  @ManyToOne(() => User, (user) => user.contributionComment)
  @JoinColumn({ name: 'coordinatorId', referencedColumnName: 'id' })
  coordinator: User;

  constructor(contributionComment: Partial<ContributionComment>) {
    super();
    Object.assign(this, contributionComment);
  }
}
