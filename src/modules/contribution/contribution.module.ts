import { Module } from '@nestjs/common';
import { ContributionService } from './contribution.service';
import { ContributionController } from './contribution.controller';
import { Contribution } from 'src/entities/contribution.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Contribution])],
  controllers: [ContributionController],
  providers: [ContributionService],
})
export class ContributionModule {}
