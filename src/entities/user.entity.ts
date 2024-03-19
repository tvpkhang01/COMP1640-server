import { GenderEnum, RoleEnum } from 'src/common/enum/enum';
import { AbstractEntity } from 'src/common/entities/abstract.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  ID: string;

  @Column()
  UserName: string;

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

  @Column({ default: false })
  Faculty: string;

  constructor(user: Partial<User>) {
    super();
    Object.assign(this, user);
  }
}
