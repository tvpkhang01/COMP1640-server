import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { Faculty } from '../..//entities/faculty.entity';
import { FacultyController } from '../faculty/faculty.controller';
import { FacultyService } from '../faculty/faculty.service';
import { Contribution } from '../..//entities/contribution.entity';
import { ContributionController } from '../contribution/contribution.controller';
import { ContributionService } from '../contribution/contribution.service';
import { ContributionComment } from '../..//entities/contributionComment.entity';
import { ContributionCommentController } from '../comtributionComment/contributionComment.controller';
import { ContributionCommentService } from '../comtributionComment/contributionComment.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { MagazineService } from '../magazine/magazine.service';
import { Magazine } from '../../entities/magazine.entity';
import { SemesterService } from '../semester/semester.service';
import { Semester } from '../../entities/semester.entity';
import { Semester } from 'src/entities/semester.entity';
import { Magazine } from 'src/entities/magazine.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Faculty,
      Contribution,
      ContributionComment,
      Magazine,
      Semester,
    ]),
  ],
  controllers: [
    UserController,
    FacultyController,
    ContributionController,
    ContributionCommentController,
  ],
  providers: [
    UserService,
    FacultyService,
    ContributionService,
    ContributionCommentService,
    CloudinaryService,
    MagazineService,
    SemesterService,
  ],
})
export class UserModule {}
