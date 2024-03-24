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

@Entity()
export class User extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  ID: string;

  @Column()
  UserName: string;

  @Column()
  Password: string = '123456789';

  @Column()
  Code: string;

  @Column()
  Email: string;

  @Column()
  Phone: string;

  @Column({ nullable: true })
  DateOfBirth: Date;

  @Column({ nullable: true })
  Avatar: string;

  @Column({ type: 'enum', enum: GenderEnum, nullable: false })
  Gender: GenderEnum;

  @Column({
    type: 'enum',
    enum: RoleEnum,
    default: RoleEnum.STUDENT,
    nullable: false,
  })
  Role: RoleEnum;

  // Faculty relationship
  @Column({ nullable: true })
  facultyId: string;
  @ManyToOne(() => Faculty, (faculty) => faculty.Student)
  @JoinColumn({ name: 'facultyId', referencedColumnName: 'ID' })
  Faculty: Faculty;

  // Contribution relationship
  @OneToMany(() => Contribution, (contribution) => contribution.Student, {
    cascade: true,
    onUpdate: 'CASCADE',
  })
  contribution: Contribution[];

  constructor(user: Partial<User>) {
    super();
    Object.assign(this, user);
  }
}
