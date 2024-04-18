import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendPendingMail(
    contributionId: string,
    mcEmail: string,
    mcName: string,
  ) {
    await this.mailerService.sendMail({
      to: mcEmail,
      subject: 'Have a contribution need check!',
      template: './pendingMail.hbs',
      context: {
        contributionId: contributionId,
        name: mcName,
      },
    });
  }

  async sendApproveMail(
    contributionId: string,
    studentEmail: string,
    studentName: string,
  ) {
    await this.mailerService.sendMail({
      to: studentEmail,
      subject: 'Your contribution has been approve!',
      template: './approveMail.hbs',
      context: {
        contributionId: contributionId,
        name: studentName,
      },
    });
  }

  async sendRejectMail(
    contributionId: string,
    studentEmail: string,
    studentName: string,
  ) {
    await this.mailerService.sendMail({
      to: studentEmail,
      subject: 'Your contribution has been reject!',
      template: './rejectMail.hbs',
      context: {
        contributionId: contributionId,
        name: studentName,
      },
    });
  }
}
