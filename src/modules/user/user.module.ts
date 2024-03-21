import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Faculty } from 'src/entities/faculty.entity';
import { FacultyController } from '../faculty/faculty.controller';
import { FacultyService } from '../faculty/faculty.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Faculty])],
  controllers: [UserController, FacultyController],
  providers: [UserService, FacultyService],
})
export class UserModule {}
