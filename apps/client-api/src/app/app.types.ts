export interface MailWebhookPayload {
  from: string;
  to: string[];
  subject: string;
  rawBody: string;
  sentAt: string;
  receivedAt: string;
}