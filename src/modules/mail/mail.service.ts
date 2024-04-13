import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendPendingMail(mcEmail: string, mcName: string) {
    await this.mailerService.sendMail({
      to: mcEmail,
      subject: 'Have a contribution need check!',
      template: './pendingMail.hbs',
      context: {
        name: mcName,
      },
    });
  }

  async sendApproveMail(studentEmail: string, studentName: string) {
    await this.mailerService.sendMail({
      to: studentEmail,
      subject: 'Have a contribution need check!',
      template: './approveMail.hbs',
      context: {
        name: studentName,
      },
    });
  }

  async sendRejectMail(studentEmail: string, studentName: string) {
    await this.mailerService.sendMail({
      to: studentEmail,
      subject: 'Have a contribution need check!',
      template: './rejectMail.hbs',
      context: {
        name: studentName,
      },
    });
  }
}
