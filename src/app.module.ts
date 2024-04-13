import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DbModule } from './common/db/db.module';
import { UserModule } from './modules/user/user.module';
import { SemesterModule } from './modules/semester/semester.module';
import { FacultyModule } from './modules/faculty/faculty.module';
import { ContributionModule } from './modules/contribution/contribution.module';
import { MagazineModule } from './modules/magazine/magazine.module';
import { ContributionCommentModule } from './modules/comtributionComment/contributionComment.module';
import { AuthModule } from './modules/auth/auth.module';
import { MailModule } from './modules/mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DbModule,
    UserModule,
    SemesterModule,
    FacultyModule,
    ContributionModule,
    MagazineModule,
    ContributionCommentModule,
    AuthModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
