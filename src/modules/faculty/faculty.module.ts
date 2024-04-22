import { Module } from '@nestjs/common';
import { FacultyService } from './faculty.service';
import { FacultyController } from './faculty.controller';
import { Faculty } from 'src/entities/faculty.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { UserService } from '../user/user.service';
import { UserController } from '../user/user.controller';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Module({
  imports: [TypeOrmModule.forFeature([Faculty, User])],
  controllers: [FacultyController, UserController],
  providers: [FacultyService, UserService, CloudinaryService],
})
export class FacultyModule {}
