import { SWISS_PHONE_NUMBER_REGEX } from "../common/constants/phone-regex.constants";
import { Service } from "typedi";
import { EnvUtils } from "../common/utils/env.utils";
import { StringUtils } from "../common/utils/string.utils";
import needle from 'needle';
import nodemailer from 'nodemailer';

@Service()
export class MailService {

    async sendMail(to: string, betreff: string, htmlBody: string, logMail = true, fromDisplayName = 'Shift Planner') {
        if (StringUtils.isEmpty(to) || StringUtils.isEmpty(betreff) || StringUtils.isEmpty(htmlBody)) {
            throw 'Error: to, betreff and htmlBody are required fields for an email.';
        }

        nodemailer.createTestAccount(async (err, account) => {
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
            let mailOptions = {
                from: `"${fromDisplayName}" <${EnvUtils.get().mailUser}>`,
                to: to,
                subject: betreff,
                html: htmlBody,
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return console.error(error);
                }
                console.log('Mail with betreff "' + betreff + '" was sent to ' + to + '.  Server Response: ' + info.messageId);
                const previewUrl = nodemailer.getTestMessageUrl(info);
                console.log('Preview URL: ' + previewUrl);
                if (logMail) {
                    mail.set("previewUrl", previewUrl);
                    mail.set("messageId", info.messageId);
                    mail.set("sent", true);
                    mail.save(null, { useMasterKey: true });
                }
            });
        });

    }
}
