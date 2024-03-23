import { AbstractEntity } from 'src/common/entities/abstract.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { StatusEnum, TermEnum } from 'src/common/enum/enum';

@Entity()
export class Contribution extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  ID: string;

  @Column()
  Title: string;

  @Column({ nullable: true })
  FilePath: string;

  @Column({
    type: 'enum',
    enum: StatusEnum,
    default: StatusEnum.REJECT,
    nullable: false,
  })
  Status: StatusEnum;

  @Column({
    type: 'enum',
    enum: TermEnum,
    default: TermEnum.DISAGREE,
    nullable: false,
  })
  Term: TermEnum;

  //   @Column()
  //   facultyId: string;

  //   @ManyToOne(() => Faculty, (faculty) => faculty.user)
  //   @JoinColumn({ name: 'facultyId', referencedColumnName: 'ID' })
  //   Faculty: Faculty;

  constructor(contribution: Partial<Contribution>) {
    super();
    Object.assign(this, contribution);
  }
}
