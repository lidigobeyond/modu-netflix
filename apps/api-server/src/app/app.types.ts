export interface MailWebhookPayload {
  from: string;
  to: string[];
  subject: string;
  rawBody: string;
}