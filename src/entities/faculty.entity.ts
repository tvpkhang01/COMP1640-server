import { AbstractEntity } from 'src/common/entities/abstract.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Faculty extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  ID: string;

  @Column()
  FacultyName: string;

  @Column({ nullable: true, default: null })
  mCoordinatorId: string;

  @OneToMany(() => User, (user) => user.Faculty, {
    cascade: true,
    onUpdate: 'CASCADE',
  })
  Student: User[];

  @OneToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'mCoordinatorId', referencedColumnName: 'ID' })
  MCoordinator: User;

  constructor(faculty: Partial<Faculty>) {
    super();
    Object.assign(this, faculty);
  }
}
