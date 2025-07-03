import { Injectable } from '@nestjs/common';
import type { Transporter } from 'nodemailer';
import { SendMailOptions } from './mail.interface';
import * as fs from 'fs';
import * as path from 'path';
import Handlebars from 'handlebars';

@Injectable()
export class MailService {
  private transporter: Transporter;

  constructor() {
    void this.initTransporter();
  }

  private async initTransporter() {
    const nodemailer = await import('nodemailer');
    this.transporter = nodemailer.createTransport({
      host: 'smtp.office365.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER!,
        pass: process.env.SMTP_PASS!,
      },
    });
  }

  private compileTemplate(templateName: string, context: any): string {
    const templatePath = path.join(
      process.cwd(),
      'src/mail/templates',
      `${templateName}.hbs`,
    );
    const templateContent = fs.readFileSync(templatePath, 'utf8');
    const compiled = Handlebars.compile(templateContent);
    return compiled(context);
  }

  async sendMail(options: SendMailOptions): Promise<void> {
    if (!this.transporter) {
      throw new Error('Mail transporter not initialized');
    }

    let htmlContent = options.html;

    if (options.templateName && options.context) {
      htmlContent = this.compileTemplate(options.templateName, options.context);
    }

    await this.transporter.sendMail({
      from: `"${options.fromName}" <${process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: htmlContent,
    });
  }
}
