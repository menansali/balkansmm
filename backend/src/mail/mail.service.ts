import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    private transporter;
    private readonly logger = new Logger(MailService.name);

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST, // e.g., smtp-relay.brevo.com
            port: 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    async sendWelcome(email: string) {
        if (!process.env.SMTP_USER) {
            this.logger.warn('SMTP not configured. Skipping welcome email.');
            return;
        }
        try {
            await this.transporter.sendMail({
                from: '"BalkanSMM Support" <support@balkansmm.com>',
                to: email,
                subject: 'Welcome to BalkanSMM! 🚀',
                html: `
                <h1>Welcome to the #1 SMM Panel</h1>
                <p>Thanks for joining. You can now deposit funds and start boosting your social media.</p>
                <a href="https://balkansmm.com/dashboard">Go to Dashboard</a>
              `
            });
            this.logger.log(`Welcome email sent to ${email}`);
        } catch (e) {
            this.logger.error(`Failed to send welcome email to ${email}`, e);
        }
    }

    async sendTicketReply(email: string, ticketId: number, message: string) {
        if (!process.env.SMTP_USER) return;
        try {
            await this.transporter.sendMail({
                from: '"BalkanSMM Support" <support@balkansmm.com>',
                to: email,
                subject: `[Ticket #${ticketId}] New Reply`,
                html: `
                <h2>Update on Ticket #${ticketId}</h2>
                <p>Support has replied:</p>
                <blockquote style="border-left: 2px solid #ccc; padding-left: 10px; color: #555;">
                    ${message}
                </blockquote>
                <p>Login to reply.</p>
              `
            });
        } catch (e) {
            this.logger.error(`Failed to email ticket reply`, e);
        }
    }
}
