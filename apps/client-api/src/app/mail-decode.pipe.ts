import { Injectable, PipeTransform } from '@nestjs/common';
import { MailWebhookPayload } from './app.types';

@Injectable()
export class MailDecodePipe implements PipeTransform<MailWebhookPayload> {
  transform(payload: MailWebhookPayload): MailWebhookPayload {
    return {
      ...payload,
      subject: this.decodeSubject(payload.subject),
      rawBody: this.decodeBody(payload.rawBody),
    };
  }

  // RFC 2047: =?charset?b?text?=
  private decodeSubject(subject: string): string {
    return subject
      .replace(
        /=\?([^?]+)\?b\?([^?]*)\?=/gi,
        (_, charset, text) => Buffer.from(text, 'base64').toString(charset),
      )
      .trim();
  }

  private decodeBody(rawBody: string): string {
    const [headers, ...bodyParts] = rawBody.split('\r\n\r\n');
    const body = bodyParts.join('\r\n\r\n');

    if (/Content-Transfer-Encoding:\s*base64/i.test(headers)) {
      return Buffer.from(body.replace(/\s/g, ''), 'base64').toString('utf-8');
    }

    return body;
  }
}