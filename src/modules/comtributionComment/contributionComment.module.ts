import { TypeOrmModule } from '@nestjs/typeorm';
import { ContributionComment } from 'src/entities/contributionComment.entity';
import { ContributionCommentController } from './contributionComment.controller';
import { ContributionCommentService } from './contributionComment.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [TypeOrmModule.forFeature([ContributionComment])],
  controllers: [ContributionCommentController],
  providers: [ContributionCommentService],
})
export class ContributionCommentModule {}
