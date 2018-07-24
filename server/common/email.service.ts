const NodeMailer: any = require('nodemailer');
import { CRUDService } from './../common/crud.service';
import { Observable } from 'rxjs';
const nodemailer = require('nodemailer');
import * as fs from 'fs';
require('dotenv').config()

export class EmailService {
  private md: any;
  private options: Object;
  private emailInfo: string = '';
  private emailForProblems: string = '';

  constructor(
    private CRUD: CRUDService,
    private stagingServer,
    private stagingClient
  ) {}

  sendVerificationLink(email, hash) {
    return new Observable( observer => {

        const fileContent = fs.readFileSync(
          __dirname + '/../../public/mail/verification.html'
        ).toString();

        const html = fileContent
        .replace(/{{LINK}}/g, `${this.stagingServer}/v1/auth/verify?hash=${hash}`)
        .replace(/{{HOST}}/g, this.stagingServer)
        .replace(/{{HOST_CLIENT}}/g, this.stagingClient);

        this.sendEmailFunction(email, "", html).subscribe( res => observer.next(), err => observer.error(err));
    })
  }


  sendPasswordRecoveryLink(user_email, passwordResetHash) {
    return new Observable( observer => {

          const fileContent = fs.readFileSync(
            __dirname + '/../../public/mail/recovery-password.html'
          ).toString();

          const html = fileContent
          .replace(/{{LINK}}/g, `${this.stagingClient}/reset?hash=${passwordResetHash}`)
          .replace(/{{HOST}}/g, this.stagingServer)
          .replace(/{{HOST_CLIENT}}/g, this.stagingClient);

          this.sendEmailFunction(user_email, "", html).subscribe( res => observer.next(), err => observer.error(err));
    });
  }

  sendEmailFunction(email, text, html) {
    return new Observable( observer => {
      nodemailer.createTestAccount((err, account) => {
        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            host: '',
            port: 465,
            secure: true, // true for 465, false for other ports
            auth: {
                user: '', // generated ethereal user
                pass: '' // generated ethereal password
            }
        });

        // setup email data with unicode symbols
        let mailOptions = {
            from: '', // sender address
            to: email, // list of receivers
            subject: 'Verification', // Subject line
            text: '', // plain text body
            html: html // html body
        };

        // send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
          if(error) {
            observer.error(error);
          }
          observer.next(true);
        });
      });
    });
  }


}
