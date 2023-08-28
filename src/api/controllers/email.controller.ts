import sendGridMail from '@sendgrid/mail';
import { AnyARecord } from 'dns';

export default class EmailController {
  public static sendCreatePasswordLink(
    user: { email: string; firstName: string },
    token: string,
    message: string
  ): void {
    if (!process.env.SENDGRID_APIKEY) throw 'SENDGRID_APIKEY not set.';
    if (!process.env.SERVER_HOST) throw 'SERVER_HOST not set.';
    if (!process.env.SENDGRID_CREATE_PASSWORD_TEMPLATE_ID)
      throw 'SENDGRID_CREATE_PASSWORD_TEMPLATE_ID not set.';
    if (!process.env.FRONTEND_HOST) throw 'FRONTEND_HOST not set.';
    if (!process.env.SENDGRID_NO_REPLY_EMAIL)
      throw 'SENDGRID_NO_REPLY_EMAIL not set.';
    if (!process.env.SENDGRID_RETURN_EMAIL)
      throw 'SENDGRID_RETURN_EMAIL not set.';

    sendGridMail.setApiKey(process.env.SENDGRID_APIKEY);
    console.log(process.env.SENDGRID_NO_REPLY_EMAIL);
    const msg = {
      to: user.email,
      from: `Wavez <${process.env.SENDGRID_NO_REPLY_EMAIL}>`,
      subject: `Wavez - Create Password`,
      dynamicTemplateData: {
        url: `${process.env.FRONTEND_HOST}/setPassword/${token}`,
        userName: user.firstName,
        email: user.email,
        message: message,
      },
      templateId: process.env.SENDGRID_CREATE_PASSWORD_TEMPLATE_ID,
      replyTo: process.env.SENDGRID_RETURN_EMAIL,
    };
    try {
      sendGridMail.send(msg);
    } catch (error) {
      console.log('Error sending the email: ' + error);
    }
  }
  public static sendNotificationEmail(
    user: { email: any; firstName: any },
    message: string
  ): void {
    if (!process.env.SENDGRID_APIKEY) throw 'SENDGRID_APIKEY not set.';
    if (!process.env.SERVER_HOST) throw 'SERVER_HOST not set.';
    if (!process.env.SENDGRID_CREATE_PASSWORD_TEMPLATE_ID)
      throw 'SENDGRID_CREATE_PASSWORD_TEMPLATE_ID not set.';
    if (!process.env.FRONTEND_HOST) throw 'FRONTEND_HOST not set.';
    if (!process.env.SENDGRID_NO_REPLY_EMAIL)
      throw 'SENDGRID_NO_REPLY_EMAIL not set.';
    if (!process.env.SENDGRID_RETURN_EMAIL)
      throw 'SENDGRID_RETURN_EMAIL not set.';

    sendGridMail.setApiKey(process.env.SENDGRID_APIKEY);
    console.log(process.env.SENDGRID_NO_REPLY_EMAIL);
    const msg = {
      to: user.email,
      from: `Wavez <${process.env.SENDGRID_NO_REPLY_EMAIL}>`,
      subject: `Wavez - Create Password`,
      dynamicTemplateData: {
        url: `${process.env.FRONTEND_HOST}`,
        userName: user.firstName,
        email: user.email,
        message: message,
      },
      templateId: process.env.SENDGRID_CREATE_PASSWORD_TEMPLATE_ID,
      replyTo: process.env.SENDGRID_RETURN_EMAIL,
    };
    try {
      sendGridMail.send(msg);
    } catch (error) {
      console.log('Error sending the email: ' + error);
    }
  }

  public static sendResetPasswordEmail(
    user: { email: string; firstName: string },
    token: string
  ): void {
    if (!process.env.SENDGRID_APIKEY) throw 'SENDGRID_APIKEY not set.';
    if (!process.env.SERVER_HOST) throw 'SERVER_HOST not set.';
    if (!process.env.FRONTEND_HOST) throw 'FRONTEND_HOST not set.';
    if (!process.env.SENDGRID_FORGET_PASSWORD_TEMPLATE_ID)
      throw 'SENDGRID_FORGET_PASSWORD_TEMPLATE_ID not set.';
    if (!process.env.SENDGRID_NO_REPLY_EMAIL)
      throw 'SENDGRID_NO_REPLY_EMAIL not set.';
    if (!process.env.SENDGRID_RETURN_EMAIL)
      throw 'SENDGRID_RETURN_EMAIL not set.';

    sendGridMail.setApiKey(process.env.SENDGRID_APIKEY);
    const msg = {
      to: user.email,
      from: `Wavez <${process.env.SENDGRID_NO_REPLY_EMAIL}>`,
      subject: 'Wavez - Forget password',
      dynamicTemplateData: {
        url: `${process.env.FRONTEND_HOST}/resetPassword/${token}`,
        userName: user.firstName,
        email: user.email,
      },
      templateId: process.env.SENDGRID_FORGET_PASSWORD_TEMPLATE_ID,
      replyTo: process.env.SENDGRID_RETURN_EMAIL,
    };
    try {
      sendGridMail.send(msg);
    } catch (error) {
      console.log('Error sending the email: ' + error);
    }
  }

  public static sendEmailToUserFromAdmin(emailObj: {
    emails: string[];
    subject: string;
    body: string;
    cc?: string[];
    bcc?: string[];
    attachments?: any[];
  }): void {
    if (!process.env.SENDGRID_APIKEY) throw 'SENDGRID_APIKEY not set.';
    if (!process.env.SENDGRID_NO_REPLY_EMAIL)
      throw 'SENDGRID_NO_REPLY_EMAIL not set.';
    if (!process.env.SENDGRID_RETURN_EMAIL)
      throw 'SENDGRID_RETURN_EMAIL not set.';
    if (!process.env.SENDGRID_ADMIN_EMAIL_TEMPLATE_ID)
      throw 'SENDGRID_ADMIN_EMAIL_TEMPLATE_ID not set.';

    sendGridMail.setApiKey(process.env.SENDGRID_APIKEY);
    const msg = {
      to: emailObj.emails,
      cc: emailObj.cc,
      bcc: emailObj.bcc,
      from: `Wavez <${process.env.SENDGRID_NO_REPLY_EMAIL}>`,
      subject: emailObj.subject,
      dynamicTemplateData: {
        body: emailObj.body,
        subject: emailObj.subject,
      },
      attachments: emailObj.attachments,
      templateId: process.env.SENDGRID_ADMIN_EMAIL_TEMPLATE_ID,
    };
    try {
      sendGridMail.send(msg, true);
    } catch (error) {
      console.log('Error sending the email: ' + error);
    }
  }

  public static sendContactUsEmail(contactUsObj: {
    firstName: string;
    lastName: string;
    phoneNumber: number;
    email: string;
    service: string;
    userType: string;
    topic: string;
  }) {
    if (!process.env.SENDGRID_APIKEY) throw 'SENDGRID_APIKEY not set.';
    if (!process.env.SENDGRID_CONTACT_US_EMAIL)
      throw 'SENDGRID_CONTACT_US_EMAIL not set.';
    if (!process.env.SENDGRID_CONTACT_US_EMAIL_TEMPLATE_ID)
      throw 'SENDGRID_CONTACT_US_EMAIL_TEMPLATE_ID not set.';
    if (!process.env.SENDGRID_CONTACT_US_FROM_EMAIL)
      throw 'SENDGRID_CONTACT_US_FROM_EMAIL not set.';

    sendGridMail.setApiKey(process.env.SENDGRID_APIKEY);
    const msg = {
      to: process.env.SENDGRID_CONTACT_US_EMAIL,
      from: `Wavez <${process.env.SENDGRID_CONTACT_US_FROM_EMAIL}>`,
      subject: 'User Inquiry',
      dynamicTemplateData: {
        ...contactUsObj,
        ...{ date: new Date().toDateString(), subject: 'User Inquiry' },
      },
      templateId: process.env.SENDGRID_CONTACT_US_EMAIL_TEMPLATE_ID,
    };
    sendGridMail.send(msg);
  }

  public static sendTripStatusChangeEmailToAdmin(emailObj: {
    adminEmails: string[];
    userEmail: string;
    subject: string;
    preHeader: string;
    message: string;
    userName: string;
    status: string;
    tripId: string;
  }): void {
    if (!process.env.SENDGRID_APIKEY) throw 'SENDGRID_APIKEY not set.';
    if (!process.env.SENDGRID_TRIP_STATUS_CHANGE_EMAIL_TEMPLATE_ID)
      throw 'SENDGRID_TRIP_STATUS_CHANGE_EMAIL_TEMPLATE_ID not set.';
    if (!process.env.SENDGRID_NO_REPLY_EMAIL)
      throw 'SENDGRID_NO_REPLY_EMAIL not set.';
    if (!process.env.ADMIN_EMAIL) throw 'ADMIN_EMAIL not set';

    emailObj.adminEmails.push(process.env.ADMIN_EMAIL);

    sendGridMail.setApiKey(process.env.SENDGRID_APIKEY);
    const msg = {
      to: emailObj.adminEmails,
      from: `Wavez <${process.env.SENDGRID_NO_REPLY_EMAIL}>`,
      subject: emailObj.subject,
      dynamicTemplateData: {
        message: emailObj.message,
        userName: emailObj.userName,
        userEmail: emailObj.userEmail,
        subject: emailObj.subject,
        preHeader: emailObj.preHeader,
        status: emailObj.status,
        tripId: emailObj.tripId,
      },
      templateId: process.env.SENDGRID_TRIP_STATUS_CHANGE_EMAIL_TEMPLATE_ID,
    };
    try {
      sendGridMail.send(msg, true);
    } catch (error) {
      console.log('Error sending the email: ' + error);
    }
  }

  // public static sendAlertToUsers(user: { email: string, firstName: string }, token: string): void {
  //     if (!process.env.SENDGRID_APIKEY) throw "SENDGRID_APIKEY not set.";
  //     if (!process.env.SERVER_HOST) throw "SERVER_HOST not set.";
  //     if (!process.env.FRONTEND_HOST) throw "FRONTEND_HOST not set.";
  //     if (!process.env.SENDGRID_ALERT_USER_TEMPLATE_ID) throw "SENDGRID_ALERT_USER_TEMPLATE_ID not set.";
  //     if (!process.env.SENDGRID_NO_REPLY_EMAIL) throw "SENDGRID_NO_REPLY_EMAIL not set.";
  //     if (!process.env.SENDGRID_RETURN_EMAIL) throw "SENDGRID_RETURN_EMAIL not set.";
  //
  //     sendGridMail.setApiKey(process.env.SENDGRID_APIKEY);
  //     const msg = {
  //         to: user.email,
  //         from: process.env.SENDGRID_NO_REPLY_EMAIL,
  //         subject: 'Wavez - Alert Vessel Change',
  //         dynamicTemplateData: {
  //             body: emailObj.body,
  //             subject: emailObj.subject
  //         },
  //         templateId: process.env.SENDGRID_ALERT_USER_TEMPLATE_ID,
  //         replyTo: process.env.SENDGRID_RETURN_EMAIL
  //     };
  //     try {
  //         sendGridMail.send(msg);
  //     } catch (error) {
  //         console.log("Error sending the email: " + error);
  //     }
  // }
}
