import { Module } from '@nestjs/common';
import { ContributionService } from './contribution.service';
import { ContributionController } from './contribution.controller';
import { Contribution } from 'src/entities/contribution.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { UserController } from '../user/user.controller';
import { UserService } from '../user/user.service';
import { Magazine } from 'src/entities/magazine.entity';
import { MagazineController } from '../magazine/magazine.controller';
import { MagazineService } from '../magazine/magazine.service';
import { ContributionCommentController } from '../comtributionComment/contributionComment.controller';
import { ContributionCommentService } from '../comtributionComment/contributionComment.service';
import { ContributionComment } from 'src/entities/contributionComment.entity';

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
  ],
})
export class ContributionModule {}
