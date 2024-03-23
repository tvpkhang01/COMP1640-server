import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DbModule } from './common/db/db.module';
import { UserModule } from './modules/user/user.module';
import { SemesterModule } from './modules/semester/semester.module';
import { FacultyModule } from './modules/faculty/faculty.module';
import { MagazineModule } from './modules/magazine/magazine.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DbModule,
    UserModule,
    SemesterModule,
    FacultyModule,
    MagazineModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
