import { Module } from '@nestjs/common';
import { ContributionService } from './contribution.service';
import { ContributionController } from './contribution.controller';
import { Contribution } from 'src/entities/contribution.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { UserController } from '../user/user.controller';
import { UserService } from '../user/user.service';

@Module({
  imports: [TypeOrmModule.forFeature([Contribution, User])],
  controllers: [ContributionController, UserController],
  providers: [ContributionService, UserService],
})
export class ContributionModule {}
