import { AbstractEntity } from 'src/common/entities';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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

  constructor(contributionComment: Partial<ContributionComment>) {
    super();
    Object.assign(this, contributionComment);
  }
}
