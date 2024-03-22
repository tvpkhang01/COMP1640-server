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
  mCoordinatorID: string | null;

  @OneToMany(() => User, (user) => user.Faculty, {
    cascade: true,
    onUpdate: 'CASCADE',
  })
  user: User[];

  @OneToOne(() => User, { nullable: true })
  @JoinColumn()
  MCoordinator: User | null;

  constructor(faculty: Partial<Faculty>) {
    super();
    Object.assign(this, faculty);
  }
}
