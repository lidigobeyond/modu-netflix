import { Injectable } from '@nestjs/common';
import { MailWebhookPayload } from './app.types';

@Injectable()
export class AppService {
  logMail(payload: MailWebhookPayload) {
    console.log(JSON.stringify(payload, null, 2));
  }
}