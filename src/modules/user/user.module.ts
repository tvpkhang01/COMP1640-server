import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Faculty } from 'src/entities/faculty.entity';
import { FacultyController } from '../faculty/faculty.controller';
import { FacultyService } from '../faculty/faculty.service';
import { Contribution } from 'src/entities/contribution.entity';
import { ContributionController } from '../contribution/contribution.controller';
import { ContributionService } from '../contribution/contribution.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Faculty, Contribution])],
  controllers: [UserController, FacultyController, ContributionController],
  providers: [UserService, FacultyService, ContributionService],
})
export class UserModule {}
