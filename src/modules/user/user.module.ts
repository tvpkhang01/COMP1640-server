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
import { ContributionComment } from 'src/entities/contributionComment.entity';
import { ContributionCommentController } from '../comtributionComment/contributionComment.controller';
import { ContributionCommentService } from '../comtributionComment/contributionComment.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Faculty,
      Contribution,
      ContributionComment,
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
  ],
})
export class UserModule {}
