import {NextFunction, Request, Response} from "express";
import Stripe from 'stripe';
import UserModel from "../models/user.model";
import {v4 as uuidv4} from "uuid";
import TripModel from "../models/trip.model";
import EmailController from "./email.controller";
import VesselModel from "../models/vessel.model";
import * as admin from "firebase-admin"
import { ServiceAccount } from "firebase-admin";
// import firebaseKayPair from './'

export default class StripeController {
  private static _STRIPE_SECRET_KEY: string;
  private static _FRONTEND_HOST: string;
  private _userModel = UserModel.getInstance().getModel();
  private _tripModel = TripModel.getInstance().getModel();
  private _VesselModel=VesselModel.getInstance().getModel()

  constructor() {
    if (!process.env.STRIPE_SECRET_KEY)
      throw 'Error: STRIPE_SECRET_KEY not set';
    StripeController._STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
    if (!process.env.FRONTEND_HOST) throw 'Error: FRONTEND_HOST not set';
    StripeController._FRONTEND_HOST = process.env.FRONTEND_HOST;
    // Initialize Firebase Admin SDK
   const credentials = {
     type: 'service_account',
     project_id: 'wavez-notification',
     private_key_id: 'd65c6d41d31c2c98f7c85a283b9072e7b10acff7',
     private_key:
       '-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQC08X7FGOE+uzHW\n8ZynsG+gnzaBg26hlp7dopojwaxTN20emKimXf8/+DpQZCrsy5smMQrFs8VvVd24\n8cFTz6XdT5ZnkutyvKJ+zv4hf+QGgpJf8iUlgCQv2ClPnwCY9ofCIxxQYAzbWEzq\nVS8ti+vqeQph8dJmYijV1PuEDJaTMCaq/RgLsrP+znq2MW7sya9ODiXHN5O0yc9i\nqmjClptysWuYYStC8AnSDQrdyQjQCRIVLInfmmprU2t3Al414wMFeScUiIx57NRq\nL0V1RHqMCOIcHIIbqH7dgOadafvtE2kHlWxRRNBw3Wp7U/Df/5nt4TVL8uXc1XIT\n+boJDxvRAgMBAAECggEAMcNZAgvdpssE4gCA/P1hNeOTsfrbqkUqW/okOkFBi4Fq\n2UdS2q5vTMCQCRwDUiyM9uv18nmGiyAqYnramJo7G6qPytx1NJD8f7Od4MizhbbT\nWt/Vp4KecSoZ8nPgTjE/FP1jBBfmcUzPmoLi/rvEni+700QWgWHtqSFyKtbrcn8L\n3kX3r3gEqr/8o1xt1srcSysLc9T0xgCTpGGas+wiLuBv2p+Xb12rHdyNUUuRA3Fe\nqIiT4LrSCylsY1+is2i5g8+22AnjgEwFZf6ugFsFEP+cwiBwZEX/GiLFtjPrAOhT\nLYf63v2N9GLxlWjvPH6WezVQcaxXRNuuLalBAJAyoQKBgQD6xvbW4jFFWGI9hHF7\nxZdxInL25+rzpKmEJ++XGw7U8oyS21VvfDo6gL60Tkn5p14jNLmUqrdJZLj1VNU+\n3ovutQX7uwHgTDloTIjT/uEaApFDO0DmjaDErcHL2EcLVCUzlS98J6gqql12IU1R\n9Rqphw/9bTyxezFNKy11B9NsrwKBgQC4tjT74vKorH4WSV5xAVlJVW4X0nQomYm3\nN7NyPlQ3SegwL+4MPQlKNgpYLo+Akmt/81Jl58DjWvp7Z+K5fSEJdJDJv41ThNvn\n8JihbSmxCnrymKGfWeYLxK8V3sr52KCoWn3oVkLQBEy85aMEpkuAVzJRHACAuKMU\nEtkDwe0ffwKBgQCDMgAFH0TDkJ+kq1trc03tRCZ9AYurd2Ov3ey8Us2JnnLoiZLC\nxmz4Gk6qqaKN13+qT3UfT8ifvu/8eSsuvuLaOR4uOgGbRIVsCU40Ck3de6ZfU+p6\nM3H+MyEF8doJFTZ5K/0xqNWTrJlEqdt3mxEdy6kT3kg4WcjLJGGdrkBvxQKBgQCq\nUK/INjoDl5FnYV1om5LFkLVD1/TtXq1iOEUJKTmkBUzH6dn4hOsk93FQYBZHujrP\nLwAiILB1svTVhzPCTwOAYXAD5tEcWpweYHWMG0jfCsfVGzGj6lO5NDEw3E6SU9HH\nijEgYzGV9vD/GErZRbDGdSBbM5OvHRCZuMtLsKvBZwKBgQDKlHqCF24WcH/HIKsU\n7TmXDagIx5M0fM6bgMLwwOJ7uJ5OVzKGrfh1RYlDXCRIwlB8hztZwcxCYfWrFR7t\nuR9Dg2yXq5Za8z/Jn9TddRQFKhC0hnP6/Va0KpDkkWA/afTyBxCYG6Q5AH0OMjCe\n2YCGA8lIpq81fdheaUTbm5ASFQ==\n-----END PRIVATE KEY-----\n',
     client_email:
       'firebase-adminsdk-4oxn7@wavez-notification.iam.gserviceaccount.com',
     client_id: '105839561782976540166',
     auth_uri: 'https://accounts.google.com/o/oauth2/auth',
     token_uri: 'https://oauth2.googleapis.com/token',
     auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
     client_x509_cert_url:
       'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-4oxn7%40wavez-notification.iam.gserviceaccount.com',
     universe_domain: 'googleapis.com',
   };

  
  }

  /**
   * Create client secret for creating a card setup intent
   * @param {Request} req - Express request object
   * @param {Request} res - Express Response Object
   * */
  public async createClientSecret(req: Request, res: Response) {
    console.log(req.body, 'body');
 
    try {
      const user = await this._userModel
        .findById(res.locals.user.id)
        .select('stripeCustomerId');
      console.log(user, 'user');

      if (user) {
        const customerId = user?.stripeCustomerId;
        console.log(customerId, 'customerId');
        if (customerId) {
          // create a new stripe object with the secret key
          const stripe = new Stripe(StripeController._STRIPE_SECRET_KEY, {
            apiVersion: '2020-08-27',
            typescript: true,
          });
          // console.log(stripe,"stripeSecond")

          // list customers payment methods
          const paymentMethods = await stripe.paymentMethods.list({
            customer: customerId,
            type: 'card',
          });
          console.log(paymentMethods, 'paymentMethodSecond');

          // only make setup intent if the customer has no payment methods saved
          if (paymentMethods?.data && paymentMethods?.data?.length === 0) {
            // create a setup intent for customer
            const intent = await stripe.setupIntents.create({
              customer: customerId,
            });
            // console.log(intent.clienbt,"intent")
            return res
              .status(200)
              .send({ success: true, client_secret: intent?.id });
          } else {
            const setupIntents = await stripe.setupIntents.list({
              customer: customerId,
              limit: 1, // Limit to 1 Setup Intent (you can adjust this based on your requirements)
            });
            return res.status(409).send({
              success: true,
              message: 'A Payment Method already exists for the user.',
              data: setupIntents,
            });
          }
        } else {
          return res.status(500).send({
            success: false,
            message: 'Stripe Customer Id not present for the user.',
          });
        }
      } else {
        return res
          .status(400)
          .send({ success: false, message: 'User Not Found.' });
      }
    } catch (err) {
      console.log(err, 'err');
      if (err?.message) {
        return res
          .status(400)
          .send({ success: false, message: `${err?.message}` });
      } else {
        return res.status(500).send({
          success: false,
          message: `There was an error fetching the user ${err}`,
        });
      }
    }
  }
//   public async sendPushNotification(deviceToken: any, title: any, body: any,req:Request,res:Response) {
//   const message = {
//     token: deviceToken,
//     notification: {
//       title: title,
//       body: body,
//     },
//   };

//   try {
//     const response = await admin.messaging().send(message);
//     console.log('Successfully sent push notification:', response);
//     res.status(200).json({success:true,message:"Notification has been sent to Vessel"})
//   } catch (error) {
//     console.error('Error sending push notification:', error);
//   }
// }
//   public async createPaymentMethod(req: Request, res: Response) {
//     console.log("api calls")
//     // console.log(req.body,"body")
//     const card = req.body.card;
//     // console.log(card.Card2.split("/"),"card")
//     const card2=req.body.card.Card2?.split("/")
//     const billing_details=req.body.billing_details
//     const userDeviceToken=req.body.token
//     const NotificationTitle=req.body.title
//     const NotificationMessage=req.body.message
//     // console.log(billing_details,"billingDetails")

//     const stripe = new Stripe(StripeController._STRIPE_SECRET_KEY, {
//       apiVersion: '2020-08-27',
//     });
// let VesselData:any
//     try {
//       const paymentMethod = await stripe.paymentMethods.create({
//         type: 'card',
//         card: {
//           number: card.cardNumber?card.cardNumber:card.number,
//           exp_month: card.Card2?card2[0]:card.exp_month,
//           exp_year: card.Card2?card2[1]:card.exp_year,
//           cvc: card.cvc,
//         },
//         billing_details: {
//           name: billing_details.name,
//           address: {
//             city: billing_details.address.city,
//             line1: billing_details.address.line1,
//             line2: billing_details.address.line2,
//             postal_code: billing_details.address.postal_code,
//             state: billing_details.address.state,
//           },
//         },
      
//       });
// const customerId = 'cus_OGFJUoLcCj3svR'; // Replace with the actual customer ID
// const attachedPaymentMethod = await stripe.paymentMethods.attach(
//   paymentMethod.id,
//   {
//     customer: customerId,
//   }
// );
//   VesselData=await this._VesselModel.findById(req.body.Id).populate("userId")
//   console.log(VesselData?.userId.email,"userId")
//   const userObj={
//     email:VesselData?.userId.email,
//     firstName:VesselData?.userId.firstName,
//     type:"USER"

//   }
// EmailController.sendNotificationEmail(userObj,"Email Has been sent to your email")
// console.log(attachedPaymentMethod, 'attachedPaymentMethod');
// //  await this.sendPushNotification(userDeviceToken,NotificationTitle,NotificationMessage,req,res)
//   // res.status(200).json({message:"Notification has been sent to vessel"})


// // res.json({ paymentMethod: attachedPaymentMethod });
//       // console.log(paymentMethod, 'paymentMethod');
//     } catch (error) {
//       console.error('Error creating payment method:', error);
//       res.status(500).json({ error: 'Failed to create payment method' });
//     }
//   }

  // public async ConfirmSetupIntent(req: Request, res: Response) {
  //   const intentId = req.body.intentId;
  //   const paymentMethodId = req.body.paymentMethodId;

  //   const stripe = new Stripe(StripeController._STRIPE_SECRET_KEY, {
  //     apiVersion: '2020-08-27',
  //   });

  //   try {
  //     await stripe.setupIntents.update(intentId, {
  //       payment_method: paymentMethodId,
  //     });

  //     const confirmedIntent = await stripe.setupIntents.confirm(intentId);

  //     res.json({ confirmedIntent });
  //   } catch (error) {
  //     console.error('Error confirming setup intent:', error);
  //     res.status(500).json({ error: 'Failed to confirm setup intent' });
  //   }
  // }
  /**
   * Create client secret for creating a card setup intent
   * @param {Request} req - Express request object
   * @param {Request} res - Express Response Object
   * */
  public async getSavedPaymentMethods(req: Request, res: Response) {
    try {
      const user = await this._userModel
        .findById(res.locals.user.id)
        .select('stripeCustomerId');
      99;
      if (user) {
        const customerId = user?.stripeCustomerId;
        console.log(customerId, 'customerid');
        if (customerId) {
          // create a new stripe object with the secret key
          const stripe = new Stripe(StripeController._STRIPE_SECRET_KEY, {
            apiVersion: '2020-08-27',
            typescript: true,
          });
          console.log(stripe, 'stripe');
          // get customer payment methods
          const paymentMethods = await stripe.paymentMethods.list({
            customer: customerId,
            type: 'card',
          });
          console.log(paymentMethods, 'paymentMethods');
          if (paymentMethods.data && paymentMethods.data.length !== 0) {
            // removing customer id from payments methods array
            paymentMethods.data.forEach((method) => {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              delete method?.customer;
            });
          }

          return res
            .status(200)
            .send({ success: true, paymentMethods: paymentMethods?.data });
        } else {
          return res.status(500).send({
            success: false,
            message: 'Stripe Customer Id not present for the user.',
          });
        }
      } else {
        return res
          .status(400)
          .send({ success: false, message: 'User Not Found.' });
      }
    } catch (err) {
      console.log(err, 'err');
      if (err?.message) {
        return res
          .status(400)
          .send({ success: false, message: `${err?.message}` });
      } else {
        console.log(err, 'error');
        return res.status(500).send({
          success: false,
          message: `There was an error fetching the user ${err}`,
        });
      }
    }
  }

  /**
   * Delete a payment method (card, bank account) by Id for Customer
   * @param {Request} req - Express request object
   * @param {Request} res - Express Response Object
   * */
  public async deleteSavedPaymentMethod(req: Request, res: Response) {
    const paymentMethodId = req.params.paymentMethodId || null;
    if (paymentMethodId) {
      try {
        const user = await this._userModel
          .findById(res.locals.user.id)
          .select('stripeCustomerId');

        if (user) {
          const customerId = user?.stripeCustomerId;
          if (customerId) {
            // create a new stripe object with the secret key
            const stripe = new Stripe(StripeController._STRIPE_SECRET_KEY, {
              apiVersion: '2020-08-27',
              typescript: true,
            });

            // get the payment method
            const paymentMethodFound = await stripe.paymentMethods.retrieve(
              paymentMethodId
            );

            // check if the payment method belongs to the user
            if (paymentMethodFound?.customer === customerId) {
              // detach payment method from customer to delete the card
              const deletedPaymentMethod = await stripe.paymentMethods?.detach(
                paymentMethodId
              );

              return res
                .status(200)
                .send({ success: true, message: 'Payment Method Deleted.' });
            } else {
              return res.status(500).send({
                success: false,
                message: 'Payment Method does not belongs to the user.',
              });
            }
          } else {
            return res.status(500).send({
              success: false,
              message: 'Stripe Customer Id not present for the user.',
            });
          }
        } else {
          return res
            .status(400)
            .send({ success: false, message: 'User Not Found.' });
        }
      } catch (err) {
        if (err?.message) {
          return res
            .status(400)
            .send({ success: false, message: `${err?.message}` });
        } else {
          return res.status(500).send({
            success: false,
            message: `There was an error fetching the user ${err}`,
          });
        }
      }
    } else {
      return res
        .status(500)
        .send({ success: false, message: 'Payment Method Id not provided.' });
    }
  }

  /**
   * charge renter after the offer of vessel accepted
   * @param {Request} req - Express request object
   * @param {Request} res - Express Response Object
   * @param next
   * */
  public async chargeRenterAfterOfferAccepted(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    if (
      res.locals.trip &&
      res.locals.trip.paymentMethod &&
      res.locals?.renter?.stripeCustomerId &&
      res.locals?.user?.stripeAccountId
    ) {
      try {
        let totalAmount = Number(res.locals.trip?.totalPrice);
        const applicationFees = Number(res?.locals?.trip?.serviceFees);
        const totalAmountWithoutApplicationFees = totalAmount - applicationFees;
        const transferGroup = uuidv4();
        res.locals?.trip?.taxRates?.forEach((rt: any) => {
          if (rt?.amount) {
            totalAmount += rt?.amount;
          }
        });

        const stripe = new Stripe(StripeController._STRIPE_SECRET_KEY, {
          apiVersion: '2020-08-27',
          typescript: true,
        });
        // let cardId = null;
        // if (res.locals?.trip.paymentToken) {
        //     const token = await stripe.tokens.retrieve(res.locals?.trip.paymentToken);
        //     const card = await stripe.customers.createSource(res.locals?.renter?.stripeCustomerId, {source: token?.id});
        //     cardId = card?.id;
        // }
        if (res.locals?.trip?.paymentMethod) {
          const totalAmountToCharge = Math.round(totalAmount * 0.5 * 100);
          // const totalApplicationFees = Math.round(((applicationFees + ownerApplicationFeesAmount) * 0.5 * 100));
          const totalAmountToTransferToOwner = Math.round(
            (totalAmountWithoutApplicationFees -
              totalAmountWithoutApplicationFees * 0.05) *
              0.5 *
              100
          );
          // const amountToTransferToOwner = Math.round(((totalAmount * 0.5) - (ownerApplicationFeesAmount)) * 100);
          // charging user in cents so * 100
          const paymentIntent = await stripe.paymentIntents.create({
            amount: totalAmountToCharge,
            currency: 'cad',
            payment_method_types: ['card'],
            payment_method: res.locals.trip.paymentMethod,
            customer: res.locals?.renter?.stripeCustomerId,
            off_session: true,
            confirm: true,
            transfer_data: {
              amount: totalAmountToTransferToOwner,
              destination: res.locals?.user?.stripeAccountId,
            },
            receipt_email: res.locals?.renter?.email
              ? res.locals?.renter?.email
              : '',
          });
          res.locals.paymentIntent = paymentIntent?.id;
          res.locals.transferGroup = transferGroup;
          res.locals.applicationFeesId = paymentIntent?.charges?.data[0]
            ? paymentIntent?.charges?.data[0].application_fee
            : '';
          next();
        } else {
          return res.status(500).send({
            success: false,
            message: `There was an error accepting the trip no payment method or token found.`,
          });
        }
        // return res.status(200).send({success: true, paymentIntentId: paymentIntent.id});
      } catch (err) {
        if (err?.message) {
          return res.status(400).send({
            success: false,
            message: `${err?.message}`,
            code: `${err?.code}`,
          });
        } else {
          return res.status(500).send({
            success: false,
            message: `There was an error accepting the trip ${err}`,
          });
        }
      }
    } else {
      return res
        .status(500)
        .send({
          success: false,
          message: `There was an error accepting the trip`,
        })
        .end();
    }
    return null;
  }

  /**
   * issue refund on cancellation
   * @param {Request} req - Express request object
   * @param {Request} res - Express Response Object
   * @param next
   * */
  public async issueRefundOnCancellation(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    if (
      res.locals.trip &&
      res.locals.trip.paymentIntent &&
      res.locals?.renter?.stripeCustomerId
    ) {
      try {
        const totalAmount = Number(res.locals.trip.displayAmount) * 0.5;
        // const refundAmount = res.locals.refundAmount;

        const stripe = new Stripe(StripeController._STRIPE_SECRET_KEY, {
          apiVersion: '2020-08-27',
          typescript: true,
        });

        if (res.locals?.refundAmount !== 0) {
          const refund = await stripe.refunds.create({
            payment_intent: res.locals.trip.paymentIntent,
            amount: res.locals?.refundAmount,
            refund_application_fee: false,
            reverse_transfer: true,
          });
          res.locals.refund = refund;
        }
        if (
          res.locals?.trip?.applicationFees &&
          res.locals?.trip?.applicationFees !== '' &&
          res.locals.applicationFeesRefundAmount !== 0
        ) {
          console.log('application fee refund initiaded');
          const applicationFeesRefund =
            await stripe.applicationFees.createRefund(
              res.locals?.trip?.applicationFees,
              {
                amount: res.locals.applicationFeesRefundAmount,
              }
            );
          res.locals.applicationFeesRefund = applicationFeesRefund;
        }

        if (
          res.locals.secondHalfRefundAmount &&
          res.locals.secondHalfRefund !== 0 &&
          res.locals.trip?.secondHalfPaymentIntent &&
          res.locals.trip?.secondHalfPaymentIntent !== ''
        ) {
          const secondRefund = await stripe.refunds.create({
            payment_intent: res.locals.trip.paymentIntent,
            amount: res.locals?.secondHalfRefundAmount,
            refund_application_fee: false,
            reverse_transfer: true,
          });
          res.locals.secondHalfRefund = secondRefund;
        }
        if (
          res.locals.trip?.securityDepositPaymentIntent &&
          res.locals.trip?.securityDepositPaymentIntent !== ''
        ) {
          await stripe.paymentIntents.cancel(
            res.locals.trip?.securityDepositPaymentIntent
          );
        }
        next();
        // return res.status(200).send({success: true, paymentIntentId: paymentIntent.id});
      } catch (err) {
        if (err?.message) {
          return res.status(400).send({
            success: false,
            message: `${err?.message}`,
            code: `${err?.code}`,
          });
        } else {
          return res.status(500).send({
            success: false,
            message: `There was an error refunding the trip ${err}`,
          });
        }
      }
    } else {
      return res
        .status(500)
        .send({
          success: false,
          message: `There was an error refunding the trip`,
        })
        .end();
    }
    return null;
  }

  /**
   * Create stripe OnBoarding link for setting up the payout method
   * @param {Request} req - Express request object
   * @param {Request} res - Express Response Object
   * */
  public async createStripeConnectOnBoardingLink(req: Request, res: Response) {
    if (res.locals.user.id) {
      const userId = res.locals.user.id;
      try {
        const user = await this._userModel.findById(userId);
        const stripe = new Stripe(StripeController._STRIPE_SECRET_KEY, {
          apiVersion: '2020-08-27',
          typescript: true,
        });
        if (user?.stripeAccountId) {
          // if stripe account already created for user then create a new connect onboarding link
          const existingAccountId = user?.stripeCustomerId;
          const existingAccountLink = await stripe.accountLinks.create({
            account: existingAccountId,
            refresh_url: `${StripeController._FRONTEND_HOST}/accountInfo/payments`,
            return_url: `${StripeController._FRONTEND_HOST}/accountInfo/payments`,
            type: 'account_onboarding',
          });

          return res.status(200).send({
            success: true,
            connectOnBoardingUrl: existingAccountLink.url,
          });
        } else {
          if (user?.email) {
            const userEmail = user?.email;
            const userFirstName = user?.firstName ? user?.firstName : '';
            const userLastName = user?.lastName ? user?.lastName : '';

            const account = await stripe.accounts.create({
              type: 'express',
              email: userEmail,
              business_type: 'individual',
              individual: {
                first_name: userFirstName,
                last_name: userLastName,
              },
              country: 'CA',
            });

            if (account?.id) {
              await this._userModel.findByIdAndUpdate(
                userId,
                { stripeAccountId: account?.id },
                { new: true }
              );

              const accountLink = await stripe.accountLinks.create({
                account: account?.id,
                refresh_url: `${StripeController._FRONTEND_HOST}/accountInfo/payments`,
                return_url: `${StripeController._FRONTEND_HOST}/accountInfo/payments`,
                type: 'account_onboarding',
              });
              return res
                .status(200)
                .send({ success: true, connectOnBoardingUrl: accountLink.url });
            } else {
              return res.status(500).send({
                success: false,
                message: `There was an error creating the stripe account`,
              });
            }
          } else {
            return res.status(500).send({
              success: false,
              message: `The user does not have a email saved in their account`,
            });
          }
        }
      } catch (err) {
        if (err?.message) {
          return res
            .status(400)
            .send({ success: false, message: `${err?.message}` });
        } else {
          return res.status(500).send({
            success: false,
            message: `There was an error fetching the user ${err}`,
          });
        }
      }
    } else {
      return res.status(500).send({
        success: false,
        message: `The user does not exists or JWT invalid.`,
      });
    }
  }

  /**
   * Create stripe OnBoarding link for setting up the payout method
   * @param {Request} req - Express request object
   * @param {Request} res - Express Response Object
   * */
  public async getUserPayoutMethods(req: Request, res: Response) {
    if (res.locals.user.id) {
      const userId = res.locals.user.id;
      try {
        const user = await this._userModel.findById(userId);
        const stripe = new Stripe(StripeController._STRIPE_SECRET_KEY, {
          apiVersion: '2020-08-27',
          typescript: true,
        });
        if (user?.stripeAccountId) {
          // if stripe account already created for user then create a new connect onboarding link
          const existingAccountId = user?.stripeAccountId;

          const account = await stripe.accounts.retrieve(existingAccountId);

          console.log(account);

          if (
            account?.external_accounts &&
            account?.external_accounts?.data?.length !== 0
          ) {
            return res.status(200).send({
              success: true,
              payoutMethods: account?.external_accounts?.data,
            });
          } else {
            return res.status(200).send({ success: true, payoutMethods: [] });
          }
        } else {
          return res.status(200).send({ success: true, payoutMethods: [] });
        }
      } catch (err) {
        if (err?.message) {
          return res
            .status(400)
            .send({ success: false, message: `${err?.message}` });
        } else {
          return res.status(500).send({
            success: false,
            message: `There was an error fetching the user ${err}`,
          });
        }
      }
    } else {
      return res.status(500).send({
        success: false,
        message: `The user does not exists or JWT invalid.`,
      });
    }
  }

  /**
   * Create stripe OnBoarding link for setting up the payout method
   * @param {Request} req - Express request object
   * @param {Request} res - Express Response Object
   * */
  public async checkPayoutVerificationStatus(req: Request, res: Response) {
    if (res.locals.user.id) {
      const userId = res.locals.user.id;
      try {
        const user = await this._userModel.findById(userId);
        const stripe = new Stripe(StripeController._STRIPE_SECRET_KEY, {
          apiVersion: '2020-08-27',
          typescript: true,
        });
        if (user?.stripeAccountId) {
          // if stripe account already created for user then create a new connect onboarding link
          const existingAccountId = user?.stripeAccountId;

          const account = await stripe.accounts.retrieve(existingAccountId);

          console.log(account);

          if (account) {
            return res.status(200).send({
              success: true,
              payoutsEnabled: account?.payouts_enabled,
              detailsSubmitted: account?.details_submitted,
            });
          } else {
            return res.status(200).send({
              success: true,
              payoutsEnabled: false,
              detailsSubmitted: false,
            });
          }
        } else {
          return res.status(200).send({ success: true, payoutMethods: [] });
        }
      } catch (err) {
        if (err?.message) {
          return res
            .status(400)
            .send({ success: false, message: `${err?.message}` });
        } else {
          return res.status(500).send({
            success: false,
            message: `There was an error fetching the user ${err}`,
          });
        }
      }
    } else {
      return res.status(500).send({
        success: false,
        message: `The user does not exists or JWT invalid.`,
      });
    }
  }

  /**
   * Get Tax Rates Specified on Stripe
   * @param {Request} req - Express request object
   * @param {Request} res - Express Response Object
   * */
  public async getAllTaxRates(req: Request, res: Response) {
    try {
      const stripe = new Stripe(StripeController._STRIPE_SECRET_KEY, {
        apiVersion: '2020-08-27',
        typescript: true,
      });

      const taxRates = await stripe.taxRates?.list();

      if (taxRates?.data?.length !== 0) {
        const taxRateList = taxRates?.data?.map((taxRate) => {
          return {
            country: taxRate.country,
            state: taxRate.state,
            display_name: taxRate.display_name,
            inclusive: taxRate.inclusive,
            percentage: taxRate.percentage,
          };
        });

        return res.status(200).send({ success: true, taxRates: taxRateList });
      } else {
        return res.status(200).send({ success: true, taxRates: [] });
      }
    } catch (err) {
      return res.status(400).send({
        success: false,
        message: `${err?.message ? err?.message : ''}`,
      });
    }
  }

  /**
   * Generate Stripe Dashboard Link
   * @param {Request} req - Express request object
   * @param {Request} res - Express Response Object
   * */
  public async generateStripeDashboardLink(req: Request, res: Response) {
    if (res.locals.user.id) {
      const userId = res.locals.user.id;
      try {
        const user = await this._userModel.findById(userId);
        const stripe = new Stripe(StripeController._STRIPE_SECRET_KEY, {
          apiVersion: '2020-08-27',
          typescript: true,
        });
        if (user?.stripeAccountId) {
          // if stripe account already created for user then create a new connect onboarding link
          const existingAccountId = user?.stripeAccountId;

          const link = await stripe.accounts.createLoginLink(existingAccountId);

          if (link?.url) {
            return res
              .status(200)
              .send({ success: true, stripeDashboardUrl: link.url });
          } else {
            return res.status(404).send({
              success: false,
              message: 'cannot create stripe dashboard link.',
            });
          }
        } else {
          return res.status(404).send({
            success: false,
            message: 'user does not have stripe account registered.',
          });
        }
      } catch (err) {
        if (err?.message) {
          return res
            .status(400)
            .send({ success: false, message: `${err?.message}` });
        } else {
          return res.status(500).send({
            success: false,
            message: `There was an error fetching the user ${err}`,
          });
        }
      }
    } else {
      return res.status(500).send({
        success: false,
        message: `The user does not exists or JWT invalid.`,
      });
    }
  }

  /**
   * Middle ware for checking user payout status when changing vessel status
   * @param {Request} req - Express request object
   * @param {Request} res - Express Response Object
   * @param {NextFunction} next - Express Next function to call the next middleware
   * */
  public async checkVesselOwnerPayoutStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    if (
      res.locals.user.id &&
      req.body?.vesselStatus === 'PUBLISHED' &&
      req.body.vesselStatus !== ''
    ) {
      try {
        const user = await this._userModel.findById(res.locals.user.id);
        const stripe = new Stripe(StripeController._STRIPE_SECRET_KEY, {
          apiVersion: '2020-08-27',
          typescript: true,
        });
        if (user?.stripeAccountId) {
          const existingAccountId = user?.stripeAccountId;

          const account = await stripe.accounts.retrieve(existingAccountId);

          console.log(account);

          if (account && account?.payouts_enabled) {
            next();
          } else {
            return res
              .status(500)
              .send({
                success: false,
                message:
                  'Cannot Publish vessel as payouts not enabled for the vessel owner',
              })
              .end();
          }
        } else {
          return res.status(500).send({
            success: false,
            message: 'Payout method not setup by vessel owner',
          });
        }
      } catch (err) {
        res.status(500).send({
          success: false,
          message: `There was an error checking user payout status ${err}`,
        });
      }
    } else {
      next();
    }
    return null;
  }

  /**
   * Middle ware for checking user payout status when changing vessel status
   * @param {Request} req - Express request object
   * @param {Request} res - Express Response Object
   * @param {NextFunction} next - Express Next function to call the next middleware
   * */
  public async checkPaymentMethodAndOwnerStatusForBooking(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    if (
      res.locals.user.id &&
      res.locals.vessel &&
      (req.body.paymentMethodId || req.body.tokenId)
    ) {
      try {
        const user = await this._userModel.findById(res.locals.user.id);
        const vesselOwner = await this._userModel.findById(
          res.locals.vessel?.userId
        );
        const stripe = new Stripe(StripeController._STRIPE_SECRET_KEY, {
          apiVersion: '2020-08-27',
          typescript: true,
        });
        if (vesselOwner?.stripeAccountId) {
          const existingAccountId = vesselOwner?.stripeAccountId;

          const stripeCustomerId = user?.stripeCustomerId;

          const account = await stripe.accounts.retrieve(existingAccountId);

          const taxResults: {
            id: string;
            state: string;
            percentage: number;
            amount: number;
            taxType: string;
          }[] = [];
          if (account && account?.payouts_enabled) {
            if (stripeCustomerId) {
              const taxRates = await stripe.taxRates.list();
              let provinceCode = '';
              switch (res.locals.vessel?.vesselAddress.province) {
                case 'Ontario':
                  provinceCode = 'ON';
                  break;
                case 'British Columbia':
                  provinceCode = 'BC';
                  break;
                default:
                  provinceCode = res.locals.vessel?.vesselAddress.province;
              }
              taxRates.data.forEach((tax) => {
                if (tax?.state === provinceCode) {
                  taxResults.push({
                    id: tax?.id,
                    state: tax?.state,
                    percentage: tax?.percentage ? tax?.percentage : 0,
                    amount:
                      Math.round(
                        (res.locals.pricing.pricingDetails.total / 100) *
                          (tax?.percentage ? tax?.percentage : 0) *
                          100
                      ) / 100,
                    taxType: tax?.display_name,
                  });
                }
              });
              // const taxIndex = taxRates.data.findIndex(tax => tax.state === provinceCode);
              // let taxPercentage = 13;
              // if (taxIndex !== -1) {
              //     taxPercentage = taxRates.data[taxIndex].percentage;
              // }
              // const taxAmount = Math.round(((res.locals.pricing.pricingDetails.total / 100) * taxPercentage) * 100) / 100;
              // res.locals.taxPercentage = taxPercentage;
              // res.locals.taxAmount = taxAmount;
              res.locals.taxRates = taxResults;
              // console.log(taxAmount);
              // console.log(taxPercentage);
              console.log(taxResults);
              console.log(res.locals.pricing.pricingDetails);
              if (req.body.paymentMethodId) {
                const paymentMethod = await stripe.paymentMethods.retrieve(
                  req.body.paymentMethodId
                );
                if (stripeCustomerId === paymentMethod.customer) {
                  next();
                } else {
                  return res.status(500).send({
                    success: false,
                    message:
                      'Provided payment method does not belong to the user',
                  });
                }
              } else {
                const token = await stripe.tokens.retrieve(req.body.tokenId);
                if (token) {
                  next();
                } else {
                  return res.status(500).send({
                    success: false,
                    message: 'Invalid Token Id Provided!',
                  });
                }
              }
            } else {
              return res.status(500).send({
                success: false,
                message: 'Stripe Customer not setup for the user',
              });
            }
          } else {
            return res
              .status(500)
              .send({
                success: false,
                message:
                  'Cannot Publish vessel as payouts not enabled for the vessel owner',
              })
              .end();
          }
        } else {
          return res.status(500).send({
            success: false,
            message: 'Payout method not setup by vessel owner',
          });
        }
      } catch (err) {
        res.status(500).send({
          success: false,
          message: `There was an error checking user payout status ${err}`,
        });
      }
    } else {
      next();
    }
    return null;
  }

  /**
   * Middle ware for checking user payout status when changing vessel status
   * @param {Request} req - Express request object
   * @param {Request} res - Express Response Object
   * */
  public async calculateBookingTaxRate(req: Request, res: Response) {
    if (res.locals.vessel) {
      try {
        const stripe = new Stripe(StripeController._STRIPE_SECRET_KEY, {
          apiVersion: '2020-08-27',
          typescript: true,
        });
        const taxResults: {
          id: string;
          state: string;
          percentage: number;
          amount: number;
          taxType: string;
        }[] = [];
        const taxRates = await stripe.taxRates.list();
        console.log(taxRates, 'taxRates');
        let provinceCode = '';
        switch (res.locals.vessel?.vesselAddress.province) {
          case 'Ontario':
            provinceCode = 'ON';
            break;
          case 'British Columbia':
            provinceCode = 'BC';
            break;
          default:
            provinceCode = res.locals.vessel?.vesselAddress.province;
        }
        taxRates.data.forEach((tax) => {
          if (tax?.state === provinceCode) {
            taxResults.push({
              id: tax?.id,
              state: tax?.state,
              percentage: tax?.percentage ? tax?.percentage : 0,
              amount:
                Math.round(
                  (res.locals.pricing.pricingDetails.total / 100) *
                    (tax?.percentage ? tax?.percentage : 0) *
                    100
                ) / 100,
              taxType: tax?.display_name,
            });
          }
        });
        // const taxIndex = taxRates.data.findIndex(tax => tax.state === provinceCode);
        // let taxPercentage = 13;
        // if (taxIndex !== -1) {
        //     taxPercentage = taxRates.data[taxIndex].percentage;
        // }
        // const taxAmount = Math.round(((res.locals.pricing.pricingDetails.total / 100) * taxPercentage) * 100) / 100;
        // res.locals.pricing.pricingDetails.taxPercentage = taxPercentage;
        // res.locals.pricing.pricingDetails.taxAmount = taxAmount;
        res.locals.pricing.pricingDetails.taxRates = taxResults;

        console.log(taxResults, 'taxResult');

        taxResults.forEach((r) => {
          res.locals.pricing.pricingDetails.total += r?.amount;
        });

        return res.status(200).send(res.locals.pricing);
      } catch (err) {
        return res.status(500).send({
          success: false,
          message: `There was an error checking tax rates ${err}`,
        });
      }
    } else {
      return res.status(500).send({
        success: false,
        message: 'There was an error fetching the tax rates',
      });
    }
  }

  /**
   * Middle ware for checking user payout status when changing vessel status
   * @param {Request} req - Express request object
   * @param {Request} res - Express Response Object
   * @param {NextFunction} next - Next Method
   * */
  public async placeStartTripSecurityDepositHoldAndChargeUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    if (req.body.tripId) {
      try {
        const tripFound = await this._tripModel
          .findById(req.body.tripId)
          .populate('renter')
          .populate('vesselOwner');
        const securityDeposit = Math.round(
          Number(tripFound?.securityDeposit) * 100
        );
        const paymentMethod = tripFound?.paymentMethod;
        const customerToCharge = tripFound?.renter?.stripeCustomerId;
        let totalAmount = Number(tripFound?.totalPrice);
        const stripeAccountId = tripFound?.vesselOwner?.stripeAccountId;
        const applicationFees = Number(tripFound?.serviceFees);
        const totalAmountWithoutApplicationFees =
          Number(totalAmount) - applicationFees;
        tripFound?.taxRates?.forEach((rt: any) => {
          if (rt?.amount) {
            totalAmount += rt?.amount;
          }
        });

        const totalAmountToCharge = Math.round(Number(totalAmount) * 0.5 * 100);
        // const totalAmountToCharge = Math.round(Number(1000) * 0.5 * 100);
        console.log(totalAmount);
        //modify service fee: orignal 0.145 to 0.05

        const totalAmountToTransferToOwner = Math.round(
          (totalAmountWithoutApplicationFees -
            totalAmountWithoutApplicationFees * 0.05) *
            0.5 *
            100
        );
        const stripe = new Stripe(StripeController._STRIPE_SECRET_KEY, {
          apiVersion: '2020-08-27',
          typescript: true,
        });
        // charging user in cents so * 100
        const halfPaymentIntent = await stripe.paymentIntents.create({
          amount: totalAmountToCharge,
          currency: 'cad',
          payment_method_types: ['card'],
          payment_method: paymentMethod,
          customer: customerToCharge,
          off_session: true,
          confirm: true,
          transfer_data: {
            amount: totalAmountToTransferToOwner,
            destination: stripeAccountId,
          },
          receipt_email: tripFound?.renter?.email
            ? tripFound?.renter?.email
            : '',
        });
        const securityPaymentIntent = await stripe.paymentIntents.create({
          amount: securityDeposit,
          currency: 'cad',
          payment_method_types: ['card'],
          payment_method: paymentMethod,
          customer: customerToCharge,
          confirm: true,
          capture_method: 'manual',
        });
        res.locals.secondApplicationFeesId = halfPaymentIntent?.charges?.data[0]
          ? halfPaymentIntent?.charges?.data[0].application_fee
          : '';
        // add 6 days to current date in milliseconds
        const sixDaysFromNow = new Date(new Date().getTime() + 518400000);
        await this._tripModel.findByIdAndUpdate(req.body.tripId, {
          securityDepositPaymentIntent: securityPaymentIntent?.id,
          secondHalfPaymentIntent: halfPaymentIntent?.id,
          securityDepositExpiresOn: sixDaysFromNow,
        });
        next();
      } catch (err) {
        return res
          .status(500)
          .send({
            success: false,
            message: `There was an error putting security deposit hold on renters payment method ${err}`,
          })
          .end();
      }
    } else {
      return res
        .status(500)
        .send({
          success: false,
          message: 'There was an error fetching the tax rates',
        })
        .end();
    }
    return null;
  }

  /**
   * Middle ware for cancelling security deposit hold on trip end
   * @param {Request} req - Express request object
   * @param {Request} res - Express Response Object
   * @param {NextFunction} next - Next Method
   * */
  public async cancelSecurityDepositHoldOnEndTrip(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    if (req.body.tripId) {
      try {
        const tripFound = await this._tripModel.findById(req.body.tripId);

        const stripe = new Stripe(StripeController._STRIPE_SECRET_KEY, {
          apiVersion: '2020-08-27',
          typescript: true,
        });

        if (
          tripFound?.securityDepositPaymentIntent &&
          tripFound?.securityDepositPaymentIntent !== ''
        ) {
          await stripe.paymentIntents.cancel(
            tripFound?.securityDepositPaymentIntent
          );
        }
        next();
      } catch (err) {
        return res
          .status(500)
          .send({
            success: false,
            message: `There was an error cancelling security deposit hold on renters payment method ${err}`,
          })
          .end();
      }
    } else {
      return res
        .status(500)
        .send({ success: false, message: 'Invalid Trip Id Provided.' })
        .end();
    }
    return null;
  }
}
