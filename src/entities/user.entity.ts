import { GenderEnum, RoleEnum } from 'src/common/enum/enum';
import { AbstractEntity } from 'src/common/entities/abstract.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Faculty } from './faculty.entity';
import { Contribution } from './contribution.entity';
import { ContributionComment } from './contributionComment.entity';

@Entity()
export class User extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userName: string;

  @Column()
  password: string = '123456789';

  @Column()
  code: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column({ nullable: true })
  dateOfBirth: Date;

  @Column({ nullable: true })
  avatar: string;

  @Column({ type: 'enum', enum: GenderEnum, nullable: false })
  gender: GenderEnum;

  @Column({
    type: 'enum',
    enum: RoleEnum,
    default: RoleEnum.STUDENT,
    nullable: false,
  })
  role: RoleEnum;

  // Faculty relationship
  @Column({ nullable: true })
  facultyId: string;
  @ManyToOne(() => Faculty, (faculty) => faculty.student)
  @JoinColumn({ name: 'facultyId', referencedColumnName: 'id' })
  faculty: Faculty;

  // Contribution relationship
  @OneToMany(() => Contribution, (contribution) => contribution.student, {
    cascade: true,
    onUpdate: 'CASCADE',
  })
  contribution: Contribution[];

  // ContributionComment relationship
  @OneToMany(
    () => ContributionComment,
    (contributionComment) => contributionComment.coordinator,
    {
      cascade: true,
      onUpdate: 'CASCADE',
    },
  )
  contributionComment: ContributionComment[];

  constructor(user: Partial<User>) {
    super();
    Object.assign(this, user);
  }
}
