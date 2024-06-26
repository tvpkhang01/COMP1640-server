import { AbstractEntity } from '../common/entities/abstract.entity';
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
  id: string;

  @Column()
  facultyName: string;

  @Column({ nullable: true, default: null })
  coordinatorId: string;

  @OneToMany(() => User, (user) => user.faculty, {
    cascade: true,
    onUpdate: 'CASCADE',
  })
  student: User[];

  @OneToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'coordinatorId', referencedColumnName: 'id' })
  coordinator: User;

  constructor(faculty: Partial<Faculty>) {
    super();
    Object.assign(this, faculty);
  }
}
