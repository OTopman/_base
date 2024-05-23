/* eslint-disable no-useless-constructor */
import { config } from "@/configs/index";
import { type EmailConfig, type MailSenderOptions } from "@/configs/interface";
import logger from "@/Helpers/logger";
import htmlToText from "html-to-text";
import nodemailer from "nodemailer";

export class MailSender {
  private readonly _config: any;
  private readonly to: string;
  private readonly from: string;
  constructor(conf: EmailConfig) {
    this._config = conf;
    this.to = this._config.email;
    this.from = `${config.app.name}<${config.mail.username}>`;
  }

  private transporter() {
    return nodemailer.createTransport({
      host: config.mail.host,
      port: config.mail.port,
      secure: config.mail.port === 465,
      pool: true,
      auth: {
        user: config.mail.username,
        pass: config.mail.password,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  /**
   * Send email
   * @param {string} subject
   * @param {string} message - Message body
   * @param {array} attachments - File names to attach
   */
  private async send(subject: string, message: string, attachments?: string[]) {
    const mailOptions: any = {
      from: this.from,
      to: this.to,
      // bcc: this.bcc,
      subject,
      html: message,
      text: htmlToText.htmlToText(message, {
        wordwrap: false,
      }),
    };

    if (attachments && attachments.length >= 0) {
      mailOptions.attachments = attachments.map((attachment) => {
        const fileName = attachment.split("/");
        return {
          filename: fileName[attachment.length - 1],
          path: attachment,
        };

        // `${__baseDir}/Views/Attachments/${attachment}`
      });
    }
    try {
      await this.transporter().sendMail(mailOptions);
    } catch (err) {
      logger.error(err);
      // await this.transporter().sendMail(mailOptions);
    }
  }

  public sendMail(options: MailSenderOptions) {
    this.send(options.subject, options.message);
  }
}
