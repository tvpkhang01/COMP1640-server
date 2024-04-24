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
      text: `Hello ${mcName},\n\nYour contribution with ID ${contributionId} needs to be checked. Please visit ${baseUrl} for more details.\n\nBest regards,\nYour Team`,
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
      subject: 'Your contribution has been approved!',
      text: `Hello ${studentName},\n\nYour contribution with ID ${contributionId} has been approved. You can view it at ${baseUrl}.\n\nBest regards,\nYour Team`,
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
      subject: 'Your contribution has been rejected!',
      text: `Hello ${studentName},\n\nUnfortunately, your contribution with ID ${contributionId} has been rejected. Please contact us for further details.\n\nBest regards,\nYour Team`,
    });
  }
}
