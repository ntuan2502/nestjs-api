export interface SendMailOptions {
  fromName: string;
  to: string;
  subject: string;
  text?: string;
  html?: string;
  templateName?: string; // 👈 thêm
  context?: Record<string, any>; // 👈 thêm
}
