import { Module } from '@nestjs/common';
import { ContributionService } from './contribution.service';
import { ContributionController } from './contribution.controller';
import { Contribution } from '../../entities/contribution.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { UserController } from '../user/user.controller';
import { UserService } from '../user/user.service';
import { Magazine } from '../../entities/magazine.entity';
import { MagazineController } from '../magazine/magazine.controller';
import { MagazineService } from '../magazine/magazine.service';
import { ContributionCommentController } from '../comtributionComment/contributionComment.controller';
import { ContributionCommentService } from '../comtributionComment/contributionComment.service';
import { ContributionComment } from '../../entities/contributionComment.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Contribution,
      User,
      Magazine,
      ContributionComment,
    ]),
  ],
  controllers: [
    ContributionController,
    UserController,
    MagazineController,
    ContributionCommentController,
  ],
  providers: [
    ContributionService,
    UserService,
    MagazineService,
    ContributionCommentService,
    CloudinaryService,
  ],
})
export class ContributionModule {}
