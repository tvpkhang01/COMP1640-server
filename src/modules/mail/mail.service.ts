import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  constructor(
    private mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async sendPendingMail(
    contributionId: string,
    mcEmail: string,
    mcName: string,
  ) {
    const baseUrl = this.configService.get('BASE_URL');
    await this.mailerService.sendMail({
      to: mcEmail,
      subject: 'Have a contribution need check!',
      template: '     Please check a contribution has been submitted or updated by a student and is awaiting your review.',
      context: {
        contributionId: contributionId,
        name: mcName,
        baseUrl: baseUrl,
      },
    });
  }

  async sendApproveMail(
    contributionId: string,
    studentEmail: string,
    studentName: string,
  ) {
    const baseUrl = this.configService.get('BASE_URL');
    await this.mailerService.sendMail({
      to: studentEmail,
      subject: 'Your contribution has been approve!',
      template: '     Please check a contribution has been submitted or updated by a student and is awaiting your review.',
      context: {
        contributionId: contributionId,
        name: studentName,
        baseUrl: baseUrl,
      },
    });
  }

  async sendRejectMail(
    contributionId: string,
    studentEmail: string,
    studentName: string,
  ) {
    const baseUrl = this.configService.get('BASE_URL');
    await this.mailerService.sendMail({
      to: studentEmail,
      subject: 'Your contribution has been reject!',
      template: 'Please check a contribution has been submitted or updated by a student and is awaiting your review.',
      context: {
        contributionId: contributionId,
        name: studentName,
        baseUrl: baseUrl,
      },
    });
  }
}
