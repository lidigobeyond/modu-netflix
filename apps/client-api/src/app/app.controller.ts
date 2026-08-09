import { Body, Controller, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { MailWebhookPayload } from './app.types';
import { MailDecodePipe } from './mail-decode.pipe';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('mail')
  receiveMail(@Body(MailDecodePipe) payload: MailWebhookPayload) {
    this.appService.logMail(payload);
    return { ok: true };
  }
}
