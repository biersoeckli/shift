import { SWISS_PHONE_NUMBER_REGEX } from "../common/constants/phone-regex.constants";
import { Service } from "typedi";
import { EnvUtils } from "../common/utils/env.utils";
import { StringUtils } from "../common/utils/string.utils";
import needle from 'needle';
import nodemailer from 'nodemailer';
import Mail from "nodemailer/lib/mailer";

@Service()
export class MailService {

    async sendMail(to: string,
        betreff: string,
        htmlBody: string,
        logMail = true,
        fromDisplayName = 'Shift Planner',
        attachments: Mail.Attachment[] = [],
        bcc?: string,
        replyTo?: string) {

        if (!EnvUtils.get().production) {
            console.warn('Cannot send sms in dev (production = false) mode.');
            console.warn('Mail Message: ' + htmlBody);
            return;
        }
        if (StringUtils.isEmpty(to) || StringUtils.isEmpty(betreff) || StringUtils.isEmpty(htmlBody)) {
            throw 'Error: to, betreff and htmlBody are required fields for an email.';
        }

        const testAccount = await nodemailer.createTestAccount();

        const Mail = Parse.Object.extend("Mails");
        let mail = new Mail();
        mail.set("to", to);
        mail.set("betreff", betreff);
        mail.set("content", htmlBody);
        mail.set("fromDisplayName", fromDisplayName);
        mail.set("sent", false);
        if (logMail) {
            mail = await mail.save(null, { useMasterKey: true });
        }

        let transporter = nodemailer.createTransport({
            host: EnvUtils.get().mailHost,
            port: EnvUtils.get().mailPort,
            secure: EnvUtils.get().mailSecure,
            auth: {
                user: EnvUtils.get().mailUser,
                pass: EnvUtils.get().mailPassword
            }
        });

        // setup email data with unicode symbols
        let mailOptions: Mail.Options = {
            from: `"${fromDisplayName}" <${EnvUtils.get().mailUser}>`,
            to,
            bcc,
            replyTo,
            subject: betreff,
            html: htmlBody,
            attachments
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Mail with betreff "' + betreff + '" was sent to ' + to + '.  Server Response: ' + info.messageId);
        const previewUrl = nodemailer.getTestMessageUrl(info);
        console.log('Preview URL: ' + previewUrl);
        if (logMail) {
            mail.set("previewUrl", previewUrl);
            mail.set("messageId", info.messageId);
            mail.set("sent", true);
            mail.save(null, { useMasterKey: true });
        }
    }
}
