import nodemailer, { SentMessageInfo } from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

import { Config } from '../config';

export const testSmtpTransportOptions: SMTPTransport.Options = {
   host: "smtp.live.com",
   port: 587,
   requireTLS: true,
   auth: {
      user: Config.hotmail_user,
      pass: Config.hotmail_pass
   }
};

export const testMailOptions: Mail.Options = {
   from: '"Serkan YESILDAG" <syesildag@hotmail.com>', // sender address
   to: "syesildag@hotmail.com, srknysldg@gmail.com", // list of receivers
   subject: "Hello subject ✔ 👻", // Subject line
   text: "Hello world?", // plain text body
   html: "<b>Hello world?</b>", // html body
};

export default async function sendEmail(mailOptions: Mail.Options = testMailOptions, smtpTransportOptions: SMTPTransport.Options = testSmtpTransportOptions): Promise<SentMessageInfo> {
   return await nodemailer
      .createTransport(smtpTransportOptions)
      .sendMail(mailOptions);
}