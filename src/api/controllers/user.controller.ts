/* eslint-disable @typescript-eslint/ban-ts-comment */
import BaseController from './base.controller';
import UserModel from '../models/user.model';
import {NextFunction, Request, Response} from 'express';
import EmailController from './email.controller';
import jwt from 'jsonwebtoken';
import Stripe from 'stripe';
import VesselModel from "../models/vessel.model";
import DocumentsModel from "../models/documents.model";
import NotificationsModel from '../models/notifications.model';
import IdentityVerificationRecordModel from '../models/IdentityVerificationRecord.model';
import IdentityVerificationVerifyRecordModel from '../models/IdentityVerificationVerifyRecord.model';
import TripModel from "../models/trip.model";
import { Document } from 'mongoose';


export default class UserController extends BaseController {
  private static _JWT_SECRET: string;
  private static _JWT_EXPIRES_IN: string;
  private static _STRIPE_SECRET_KEY: string;
  private static _SET_PASSWORD_JWT: string;
  private static _BIOMETRIC_JWT_SECRET: string;
  private _userModel = UserModel.getInstance().getModel();
  private _vesselModel = VesselModel.getInstance().getModel();
  private _documentModel = DocumentsModel.getInstance().getModel();
  private _identityVerificationRecordModel =
    IdentityVerificationRecordModel.getInstance().getModel();
  private _identityVerificationVerifyRecordModel =
    IdentityVerificationVerifyRecordModel.getInstance().getModel();
  private _tripModel = TripModel.getInstance().getModel();

  constructor() {
    super(UserModel.getInstance().getModel());
    if (!process.env.JWT_SECRET) throw 'Error: JWT_SECRET not set';
    UserController._JWT_SECRET = process.env.JWT_SECRET;
    if (!process.env.JWT_EXPIRES_IN) throw 'Error: JWT_EXPIRES_IN not set';
    UserController._JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;
    if (!process.env.STRIPE_SECRET_KEY)
      throw 'Error: STRIPE_SECRET_KEY not set';
    UserController._STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
    if (!process.env.SET_PASSWORD_JWT) throw 'Error: SET_PASSWORD_JWT not set';
    UserController._SET_PASSWORD_JWT = process.env.SET_PASSWORD_JWT;
    if (!process.env.BIOMETRIC_JWT_SECRET)
      throw 'Error: BIOMETRIC_JWT_SECRET not set';
    UserController._BIOMETRIC_JWT_SECRET = process.env.BIOMETRIC_JWT_SECRET;
  }

  /**
   * For signing up a new user
   * */

  public async signUp(req: Request, res: Response): Promise<Response> {
    if (req.body.agreementAccepted) {
      try {
        let user = await this._userModel.findOne({
          email: req.body.email.toLowerCase(),
        });
        if (user) {
          return res.status(409).send({
            status: false,
            message: 'Email ID already exists. Please try with a new ID.',
          });
        } else {
          // create a new stripe object with the secret key
          const stripe = new Stripe(UserController._STRIPE_SECRET_KEY, {
            apiVersion: '2020-08-27',
            typescript: true,
          });

          // create a new stripe customer
          const customer = await stripe.customers.create({
            email: req.body.email,
            phone: req.body.phoneNumber,
            name: `${req.body.firstName} ${req.body.lastName}`,
          });

          // save the customer id returned by stripe in the req.body to be saved in the database
          req.body.stripeCustomerId = customer.id;
          req.body.email = req.body.email.toLowerCase();
          req.body.paymentDue = 0;
          req.body.strikeCount = 0;
          user = new this._userModel({ ...req.body, userType: 'USER' });
          const newUser = await user.save();

          const userObj = {
            email: req.body.email,
            firstName: req.body.firstName,
            type: 'USER',
          };
          // creating a token that expires in 1 hour
          const token = jwt.sign(
            { email: req.body.email },
            UserController._SET_PASSWORD_JWT,
            { expiresIn: UserController._JWT_EXPIRES_IN }
          );
          console.log(token);
          await EmailController.sendCreatePasswordLink(
            userObj,
            token,
            'Your account has been successfully created and the only thing remaining is to create your password.'
          );
          // return res;
          return res.status(200).send({
            success: true,
            email: req.body.email,
            message: 'Account Created and Email Sent!!',
          });
        }
      } catch (error) {
        return res.status(500).send({ message: 'error occurred', err: error });
      }
    } else {
      return res.status(500).send({
        success: false,
        message: 'Agreement should be accepted to create an account.',
      });
    }
  }

  //send Customer id to mobile
  public async getCustomerId(req: Request, res: Response): Promise<Response> {
   
      try {
        let user = await this._userModel.findById({_id:req.params.id}).select("stripeCustomerId");
        console.log(user,"user")
        if (user) {
          return res.status(200).send({
            success: true,
            message: 'Stripe Customer Id',
            data:user
          });
        } else {
          // create a new stripe object with the secret key
          

          // create a new stripe customer
          

         
         
          // return res;
          return res.status(200).send({
            success: true,
            email: req.body.email,
            message: 'Account Created and Email Sent!!',
          });
        }
      } catch (error) {
        return res.status(500).send({ message: 'error occurred', err: error });
      }
    } 
  

  /**
   * Create pseudo admin
   * */
  public async createPseudoAdmin(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      let user = await this._userModel.findOne({ email: req.body.email });
      if (user) {
        return res.status(409).send({
          status: false,
          message: 'Email ID already exists. Please try with a new ID.',
        });
      } else {
        req.body.email = req.body.email.toLowerCase();
        user = new this._userModel({ ...req.body, userType: 'PSEUDO_ADMIN' });
        const newUser = await user.save();

        const userObj = {
          email: req.body.email,
          firstName: req.body.firstName,
          type: 'PSEUDO_ADMIN',
        };
        // creating a token that expires in 1 hour
        const token = jwt.sign(
          { email: req.body.email },
          UserController._SET_PASSWORD_JWT,
          { expiresIn: UserController._JWT_EXPIRES_IN }
        );
        console.log(token);
        await EmailController.sendCreatePasswordLink(
          userObj,
          token,
          'You have been invited as a pseudo admin. Your account has been successfully created and the only thing remaining is to create your password.'
        );
        // return res;
        return res.status(200).send({
          success: true,
          email: req.body.email,
          message: 'Account Created and Email Sent!!',
        });
      }
    } catch (error) {
      return res.status(500).send({ message: 'error occurred', err: error });
    }
  }

  public async getAllPseudoAdmin(req: Request, res: Response) {
    const pAdmins = await this._userModel.find({ userType: 'PSEUDO_ADMIN' });
    if (pAdmins) {
      return res.status(200).send(pAdmins);
    } else {
      return res.status(500).send({ message: 'Not Found' });
    }
  }

  public async updatePseudoAdmin(req: Request, res: Response) {
    const user = await this._userModel.findOne({ email: req.body.email });
    try {
      if (user) {
        return res.status(409).send({
          status: false,
          message: 'Email ID already exists. Please try with a new email ID.',
        });
      } else {
        const user = this._userModel.findByIdAndUpdate(
          { _id: req.params.id },
          req.body,
          { new: true }
        );
        return res.status(200).send(user);
      }
    } catch (error) {
      return res.status(500).send({ message: 'error occurred', err: error });
    }
  }

  public async deletePseudoAdmin(req: Request, res: Response) {
    this._userModel.findByIdAndDelete(
      {
        _id: req.params.id,
      },
      // @ts-ignore
      (err, model) => {
        if (err) return res.status(500).send(err);
        return res.json(model);
      }
    );
  }

  public async forgetPassword(req: Request, res: Response): Promise<Response> {
    try {
      const user = await this._userModel.findOne({
        email: req.body.email.toLowerCase(),
      });
      if (user) {
        const token = jwt.sign(
          { email: req.body.email, type: user.get('userType') },
          UserController._SET_PASSWORD_JWT,
          { expiresIn: UserController._JWT_EXPIRES_IN }
        );
        await EmailController.sendResetPasswordEmail(
          {
            email: req.body.email,
            firstName: user.get('firstName'),
          },
          token
        );
        return res.status(200).send({ success: true, message: 'Email sent.' });
      } else {
        return res.status(404).send({
          success: false,
          message: 'Invalid Email ID',
          description: 'Email not found.',
        });
      }
    } catch (error) {
      return res.status(500).send(error);
    }
  }

  public async getUserListings(req: Request, res: Response): Promise<Response> {
    const { email, id } = res.locals.user;
    try {
      // const rentals = await this._rentalsModel.find({userId: id});
      // const stays = await this._staysModel.find({userId: id});
      // const charters = await this._charterModel.find({userId: id});
      const vessels = await this._vesselModel.find({ userId: id });
      // const allListings = rentals.concat(stays, charters, vessels);
      return res.status(200).send({ success: true, listings: vessels });
    } catch (error) {
      return res.status(500).send({ success: false, message: error });
    }
  }

  public async getUserListingsGuest(
    req: Request,
    res: Response
  ): Promise<Response> {
    const id = req.params.id;
    try {
      const vessels = await this._vesselModel
        .find({
          userId: id,
          vesselStatus: 'PUBLISHED',
        })
        .lean()
        .populate('vesselCategory', 'name')
        .populate('userId', 'firstName lastName profileImageUrl email')
        .select('-documentsIds')
        .populate('vesselFeatures');
      // const stays = await this._staysModel.find({userId: id}).lean().populate('vesselCategory', 'name')
      //     .populate('userId', 'firstName lastName').select('-documentsIds')
      //     .populate('vesselFeatures');
      // const charters = await this._charterModel.find({userId: id}).lean().populate('vesselCategory', 'name')
      //     .populate('userId', 'firstName lastName').select('-documentsIds')
      //     .populate('vesselFeatures');
      // const allListings = rentals.concat(stays, charters);
      return res.status(200).send({ success: true, listings: vessels });
    } catch (error) {
      return res.status(500).send({ success: false, message: error });
    }
  }

  public async getUserDetails(req: Request, res: Response): Promise<Response> {
    const { id } = res.locals.user;
    try {
      if (id) {
        // only send the firstname, lastname, email, userType and id of the user
        const user = await this._userModel.findById(
          id,
          '_id firstName lastName email userType phoneNumber gender profileImageUrl userAddress primaryLanguage isVesselOwner dateOfBirth rawAddress theme'
        );
        if (user) {
          return res.status(200).send(user);
        }
      }
      return res
        .status(404)
        .send({ success: false, message: 'User not found.' });
    } catch (error) {
      return res.status(500).send({ success: false, message: error });
    }
  }

  public async getUserDetailsWEBRTC(
    req: Request,
    res: Response
  ): Promise<Response> {
    const _notificationsModel = NotificationsModel.getInstance().getModel();
    const { id } = res.locals.user;
    try {
      if (id) {
        // only send the firstname, lastname, email, userType and id of the user
        const user = await this._userModel.findById(id);

        if (user) {
          const notification = await _notificationsModel.findOne({
            user: user._id,
          });

          const userInitials = `${
            user?.firstName ? user?.firstName.split('')[0] : ''
          }${user?.lastName ? user?.lastName.split('')[0] : ''}`;
          return res.status(200).send({
            success: true,
            message: 'Authentication successful!',
            userId: user._id,
            userType: user.userType,
            firstName: user.firstName,
            lastName: user.lastName,
            profileImageUrl: user.profileImageUrl,
            isVesselOwner: user.isVesselOwner,
            isAdmin: false,
            isPseudoAdmin: false,
            userInitials: userInitials,
            playerIds: user.playerIds,
            theme: user.theme,
            email: user.email,
            notification: notification,
          });
        }
      }
      return res
        .status(404)
        .send({ success: false, message: 'User not found.' });
    } catch (error) {
      return res.status(500).send({ success: false, message: error });
    }
  }

  // return res.json({
  //                     success: true,
  //                     message: 'Authentication successful!',
  //                     token: token,
  //                     userId: user._id,
  //                     userType: user.userType,
  //                     firstName: user.firstName,
  //                     lastName: user.lastName,
  //                     profileImageUrl: user.profileImageUrl,
  //                     isVesselOwner: user.isVesselOwner,
  //                     isAdmin: isAdmin,
  //                     isPseudoAdmin: isPseudoAdmin,
  //                     userInitials: userInitials,
  //                     playerIds: user.playerIds,
  //                     theme: user.theme,
  //                     email: user.email,
  //                     notification: notification
  //                 });

  public async updateUserPublicKey(
    req: Request,
    res: Response
  ): Promise<Response> {
    const { id } = res.locals.user;
    try {
      if (id && req.body.publicKey) {
        // update the user's public key
        const user = await this._userModel.findByIdAndUpdate(
          id,
          { biometricPublicKey: req.body.publicKey },
          { new: true }
        );
        if (user) {
          const token = jwt.sign(
            { id: user._id },
            UserController._BIOMETRIC_JWT_SECRET
          );
          return res
            .status(200)
            .send({ userDetails: user, biometricToken: token });
        }
      }
      return res.status(404).send({
        success: false,
        message: 'User not found or public key not provided.',
      });
    } catch (error) {
      return res.status(500).send({ success: false, message: error });
    }
  }

  public async updateUserInfo(req: Request, res: Response) {
    try {
      // Removing the values that can't be updated
      delete req.body.password;
      delete req.body.email;
      delete req.body.stripeCustomerId;
      delete req.body.disabled;
      delete req.body.agreementAccepted;
      delete req.body.documentsIds;
      delete req.body.isVesselOwner;
      delete req.body.stripeAccountId;

      const updatedModel = await this._userModel.findByIdAndUpdate(
        res.locals.user.id,
        req.body,
        {
          new: true,
          projection: {
            password: 0,
            stripeCustomerId: 0,
            agreementAcceptedDate: 0,
            agreementAccepted: 0,
            documentsIds: 0,
            disabled: 0,
          },
        }
      );

      return res.json(updatedModel);
    } catch (err) {
      return res.status(500).send(err);
    }
  }

  /**
   * get all the users for admin
   * @param {Request} req - Express request object
   * @param {Request} res - Express Response Object
   * */
  public async getAllUsers(req: Request, res: Response) {
    try {
      const dateRegex = new RegExp(
        '^([0-2][0-9]|(3)[0-1])(\\/)(((0)[0-9])|((1)[0-2]))(\\/)\\d{4}$'
      );
      const page: number = parseInt(<string>req.query.p) || 1;
      const size: number = parseInt(<string>req.query.s) || 5;
      const order = req.query.o || {};

      const text =
        <string>req.query.f && <string>req.query.f !== ''
          ? <string>req.query.f
          : '';
      const getAllEmails = !!req.query.getAllEmails;

      if (getAllEmails) {
        const users = await this._userModel
          .find({ userType: 'USER' })
          .select('email -_id');
        return res.status(200).send(users);
      } else {
        const query: any[] = [
          {
            firstName: {
              $regex: `.*${text}.*`,
              $options: 'i',
            },
          },
          { lastName: { $regex: `.*${text}.*`, $options: 'i' } },
          { email: { $regex: `.*${text}.*`, $options: 'i' } },
        ];
        // if the filter contains any numbers or date value in  (dd/mm/yyyy) format
        if (dateRegex.test(text)) {
          console.log(text);
          try {
            const dateStrings = text.split('/');
            const filterStartDate = new Date(
              `${dateStrings[1]}/${dateStrings[0]}/${dateStrings[2]}`
            );
            const filterEndDate = new Date(filterStartDate.getTime());
            filterStartDate.setHours(0, 0, 0, 0);
            filterEndDate.setHours(19, 59, 59);
            console.log(filterStartDate.toISOString());
            console.log(filterEndDate.toISOString());
            query.push({
              updatedAt: { $gte: filterStartDate, $lte: filterEndDate },
            });
          } catch (dateError) {
            console.log(dateError);
          }
        }
        console.log(query);
        const userCount = await this._userModel.countDocuments({
          $or: query,
          userType: 'USER',
        });
        const users = await this._userModel
          .find({ $or: query, userType: 'USER' })
          .collation({ locale: 'en' })
          .lean()
          .select('firstName lastName email isVesselOwner updatedAt documents')
          .populate('documents')
          .skip(size * (page - 1))
          .limit(size)
          .sort(order);
        return res.status(200).send({
          totalCount: userCount,
          pageNumber: page,
          pageSize: size,
          sortOrder: order,
          users: users,
        });
      }
    } catch (error) {
      return res.status(500).send({
        success: false,
        message: `There was an error fetching the users. ${error}`,
      });
    }
  }

  /**
   * get all the users for admin Dashboard
   * @param {Request} req - Express request object
   * @param {Request} res - Express Response Object
   * */
  public async getAllUsersDashboard(req: Request, res: Response) {
    try {
      let i: number;
      const currYearDayOne = new Date(new Date().getFullYear(), 0, 1);
      const today = new Date();
      let userCount;
      for (i = 1; i <= 12; i++) {
        userCount = await this._userModel.aggregate([
          {
            $match: {
              createdAt: { $gte: currYearDayOne, $lt: today },
              userType: 'USER',
            },
          },
          {
            $group: {
              _id: {
                month: { $month: '$createdAt' },
              },
              count: { $sum: 1 },
            },
          },
        ]);
      }
      return res.status(200).send(userCount);
    } catch (error) {
      return res.status(500).send({
        success: false,
        message: `There was an error fetching the users. ${error}`,
      });
    }
  }

  /**
   * get user by Id for admin
   * @param {Request} req - Express request object
   * @param {Request} res - Express Response Object
   * */
  public async getUserById(req: Request, res: Response) {
    try {
      const id = req.params.userId;
      if (id) {
        const userDetails = await this._userModel
          .findById(id)
          .select(
            '-password -stripeCustomerId -documentsIds -biometricPublicKey'
          );
        return res.status(200).send(userDetails);
      } else {
        return res
          .status(500)
          .send({ success: false, message: 'User Id not provided.' });
      }
    } catch (error) {
      return res.status(500).send({
        success: false,
        message: `There was an error fetching the user by Id. ${error}`,
      });
    }
  }

  /**
   * updated user status (disable / enable) for admin
   * @param {Request} req - Express request object
   * @param {Request} res - Express Response Object
   * */
  public async updateUserStatus(req: Request, res: Response) {
    try {
      const id = req.params.userId;
      if (id) {
        await this._userModel.findByIdAndUpdate(id, {
          disabled: req.body.disabled,
        });
        return res.status(200).send({
          success: false,
          message: `User ${req.body.disabled ? 'Disabled' : 'Enabled'}`,
        });
      } else {
        return res
          .status(500)
          .send({ success: false, message: 'User Id not provided.' });
      }
    } catch (error) {
      return res.status(500).send({
        success: false,
        message: `There was an error fetching the user by Id. ${error}`,
      });
    }
  }

  /**
   * delete user by Id (admin panel)
   * @param {Request} req - Express request object
   * @param {Request} res - Express Response Object
   * */
  public async deleteUserById(req: Request, res: Response) {
    try {
      const id = req.params.userId;
      if (id) {
        const user = await this._userModel.findById(id);
        if (user) {
          // if stripe customer id exists then delete the stripe customer
          if (user?.stripeCustomerId) {
            // create a new stripe object with the secret key
            const stripe = new Stripe(UserController._STRIPE_SECRET_KEY, {
              apiVersion: '2020-08-27',
              typescript: true,
            });
            // deleting the stripe customer

            await stripe.customers?.del(user?.stripeCustomerId);
          }
          await this._userModel.findByIdAndDelete(id);
          await this._identityVerificationVerifyRecordModel.findOneAndRemove({
            CustomerReferenceID: id.toString(),
          });
          await this._identityVerificationRecordModel.findOneAndRemove({
            CustomerReferenceID: id.toString(),
          });
          const vesselsToDelete = await this._vesselModel.find({ userId: id });
          await Promise.all(
            vesselsToDelete.map(async (vessel: any) => {
              await this._vesselModel.findByIdAndDelete(vessel._id);
            })
          );
          return res.status(200).send({
            success: false,
            message: `User and User listings Deleted`,
          });
        } else {
          return res
            .status(200)
            .send({ success: false, message: `User not Found.` });
        }
      } else {
        return res
          .status(500)
          .send({ success: false, message: 'User Id not provided.' });
      }
    } catch (error) {
      return res.status(500).send({
        success: false,
        message: `There was an error fetching the user by Id. ${error}`,
      });
    }
  }

  /**
   * send the user email from admin panel
   * @param {Request} req - Express request object
   * @param {Request} res - Express Response Object
   * */
  public async sendUserEmailFromAdmin(req: Request, res: Response) {
    try {
      if (!req.body.cc) {
        req.body.cc = [];
      }
      if (!req.body.bcc) {
        req.body.bcc = [];
      }

      req.body.attachments = [];
      if (req.files && req.files.length !== 0) {
        // @ts-ignore
        const files: any[] = req.files;
        files.forEach((file: any) => {
          const attachObj = {
            filename: file.originalname,
            type: file.mimetype,
            content: file.buffer.toString('base64'),
            disposition: 'attachment',
          };
          req.body.attachments.push(attachObj);
        });
      }
      //check if the emails, cc and bcc are arrays unless make them into arrays by splitting with a ","
      !Array.isArray(req.body.emails) &&
        req.body.emails &&
        req.body.emails.length !== 0 &&
        (req.body.emails = req.body.emails.split(','));
      !Array.isArray(req.body.cc) &&
        req.body.cc &&
        req.body.cc.length !== 0 &&
        (req.body.cc = req.body.cc.split(','));
      !Array.isArray(req.body.bcc) &&
        req.body.bcc &&
        req.body.bcc.length !== 0 &&
        (req.body.bcc = req.body.bcc.split(','));
      await EmailController.sendEmailToUserFromAdmin(req.body);
      return res.status(200).send({ success: true, message: 'Email(s) Sent.' });
    } catch (error) {
      return res.status(500).send({
        success: false,
        message: `There was an error sending the email. ${error}`,
      });
    }
  }

  /**
   * search the users email addresses for sending email from admin panel
   * @param {Request} req - Express request object
   * @param {Request} res - Express Response Object
   * */
  public async searchUserEmails(req: Request, res: Response) {
    const query = req.query.searchText as string;
    if (query) {
      try {
        const userEmails = await this._userModel
          .find({ email: { $regex: `.*${query}.*`, $options: 'i' } })
          .select('email -_id')
          .limit(5);
        return res.status(200).send(userEmails);
      } catch (error) {
        return res.status(500).send({
          success: false,
          message: `There was an error fetching the user by Id. ${error}`,
        });
      }
    } else {
      return res.status(200).send([]);
    }
  }

  /**
   * save vessel license to user documents
   * @param {Request} req - Express request object
   * @param {Request} res - Express Response Object
   * @param {NextFunction} next - call next middleware
   * */
  public saveUploadedVesselLicense = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    let licenseFrontDocument: {
      fileType: string;
      originalFileName: any;
      fileURL: any;
      isVerified: boolean;
      isRejected: boolean;
      rejectionReason: boolean;
    } | null = null;
    let licenseBackDocument: {
      fileType: string;
      originalFileName: any;
      fileURL: any;
      isVerified: boolean;
      isRejected: boolean;
      rejectionReason: boolean;
    } | null = null;
    const documentsToDelete: any[] = [];
    const newDocumentArray: any[] = [];

    try {
      if (!res.locals.user?.id) {
        res.status(500).send({
          success: false,
          message: 'Invalid User Id Provided',
        });
      } else {
        const user = await this._userModel
          .findById(res.locals.user.id)
          .populate('documents');

        const userDocuments = user?.documents;
        const files: any = req.files;
        if (files?.licenseFront && files.licenseFront[0]?.url) {
          const licenseFrontUrl = files.licenseFront[0].url.split('?se')[0];
          licenseFrontDocument = {
            fileType: 'VesselLicenseFront',
            originalFileName: files.licenseFront[0]?.originalname || '',
            fileURL: licenseFrontUrl,
            isVerified: false,
            isRejected: false,
            rejectionReason: false,
          };
        }

        if (files?.licenseBack && files.licenseBack[0]?.url) {
          const licenseBackUrl = files.licenseBack[0].url.split('?se')[0];
          licenseBackDocument = {
            fileType: 'VesselLicenseBack',
            originalFileName: files.licenseBack[0]?.originalname || '',
            fileURL: licenseBackUrl,
            isVerified: false,
            isRejected: false,
            rejectionReason: false,
          };
        }

        if (userDocuments && userDocuments.length !== 0) {
          userDocuments.forEach((document: any) => {
            if (
              licenseFrontDocument &&
              document.fileType === 'VesselLicenseFront'
            ) {
              documentsToDelete.push(document);
            } else if (
              licenseBackDocument &&
              document.fileType === 'VesselLicenseBack'
            ) {
              documentsToDelete.push(document);
            } else {
              newDocumentArray.push(document._id);
            }
          });
        }
        console.log(newDocumentArray);

        const documentSaveModel: any[] = [];
        if (licenseFrontDocument || licenseBackDocument) {
          licenseFrontDocument &&
            documentSaveModel.push(
              new this._documentModel(licenseFrontDocument)
            );
          licenseBackDocument &&
            documentSaveModel.push(
              new this._documentModel(licenseBackDocument)
            );

          const savedDocuments = await this._documentModel.create(
            documentSaveModel
          );
          let savedDocumentIds: any[] = [];
          if (Array.isArray(savedDocuments)) {
            savedDocumentIds = savedDocuments.map(
              (document: Document<any>) => document._id
            );
          } else {
            savedDocumentIds = [savedDocuments._id];
          }

          const updatedDocumentIds = savedDocumentIds.concat(newDocumentArray);
          await this._userModel.findByIdAndUpdate(res.locals.user.id, {
            documents: updatedDocumentIds,
          });
          const documentIdsToDelete = documentsToDelete.map((doc) => doc._id);
          await this._documentModel.deleteMany({
            _id: { $in: documentIdsToDelete },
          });
          res.locals.documentsToDelete = documentsToDelete;
          next();
        } else {
          res.status(500).send({
            success: false,
            message: 'No Files provided to save.',
          });
        }
      }
    } catch (err) {
      res.status(500).send({
        success: false,
        message: `There was an error saving the vessel license ${err}`,
      });
    }
  };

  public async getUploadedVesselLicense(req: Request, res: Response) {
    try {
      if (res.locals?.user?.id) {
        const user = await this._userModel
          .findById(res.locals?.user?.id)
          .populate('documents')
          .select('documents');
        return res.status(200).send(user);
      } else {
        return res
          .status(500)
          .send({ success: false, message: `Invalid User Id provided.` });
      }
    } catch (err) {
      return res.status(500).send({
        success: false,
        message: `There was an error getting the vessel license for the user ${err}`,
      });
    }
  }

  public async getAllUsersThatHasDocs(req: Request, res: Response) {
    console.log(req.body, 'body');
    try {
      const users = await this._userModel
        .find({ 'documents.0': { $exists: true } })
        .lean()
        .select('firstName lastName email isVesselOwner updatedAt documents')
        .populate('documents');
      return res.status(200).send(users);
    } catch (error) {
      return res.status(500).send({
        success: false,
        message: `There was an error fetching the users. ${error}`,
      });
    }
  }

  /**
   * request user account deletion by user
   * @param {Request} req - Express request object
   * @param {Request} res - Express Response Object
   * */
  public async requestUserAccountDeletionByUser(req: Request, res: Response) {
    try {
      const id = res.locals.user.id;
      if (id) {
        const user = await this._userModel.findById(id);
        if (user) {
          const thirtyDaysFromNow = new Date(new Date().getTime() + 2592000000);
          await this._userModel.findByIdAndUpdate(id, {
            deleteBy: thirtyDaysFromNow,
            disabled: true,
          });
          return res.status(200).send({
            success: false,
            message: `User scheduled to delete in 30 days.`,
          });
        } else {
          return res
            .status(404)
            .send({ success: false, message: `User not Found.` });
        }
      } else {
        return res.status(500).send({
          success: false,
          message: 'User Id not provided or invalid user id.',
        });
      }
    } catch (error) {
      return res.status(500).send({
        success: false,
        message: `There was an error fetching the user by Id. ${error}`,
      });
    }
  }

  /**
   * request user account deletion by user
   * @param {Request} req - Express request object
   * @param {Request} res - Express Response Object
   * */
  public async requestUserAccountDeletionByAdmin(req: Request, res: Response) {
    try {
      const id = req.params.userId;
      if (id) {
        const user = await this._userModel.findById(id);
        if (user) {
          const thirtyDaysFromNow = new Date(new Date().getTime() + 2592000000);
          await this._userModel.findByIdAndUpdate(id, {
            deleteBy: thirtyDaysFromNow,
            disabled: true,
          });
          return res.status(200).send({
            success: false,
            message: `User scheduled to delete in 30 days.`,
          });
        } else {
          return res
            .status(404)
            .send({ success: false, message: `User not Found.` });
        }
      } else {
        return res.status(500).send({
          success: false,
          message: 'User Id not provided or invalid user id.',
        });
      }
    } catch (error) {
      return res.status(500).send({
        success: false,
        message: `There was an error fetching the user by Id. ${error}`,
      });
    }
  }

  /**
   * revoke user account deletion by user
   * @param {Request} req - Express request object
   * @param {Request} res - Express Response Object
   * */
  public async revokeUserAccountDeletion(req: Request, res: Response) {
    try {
      const id = req.params.userId;
      if (id) {
        const user = await this._userModel.findById(id);
        if (user) {
          const user = await this._userModel.findByIdAndUpdate(id, {
            deleteBy: undefined,
            disabled: false,
          });
          return res.status(200).send({
            success: false,
            message: `User scheduled to delete in 30 days.`,
          });
        } else {
          return res
            .status(404)
            .send({ success: false, message: `User not Found.` });
        }
      } else {
        return res.status(500).send({
          success: false,
          message: 'User Id not provided or invalid user id.',
        });
      }
    } catch (error) {
      return res.status(500).send({
        success: false,
        message: `There was an error fetching the user by Id. ${error}`,
      });
    }
  }

  /**
   * update strikes for users
   * @param {Request} req - Express request object
   * @param {Request} res - Express Response Object
   * */
  public async updateUserStrikes(req: Request, res: Response) {
    try {
      const id = req.params.userId;
      if (id) {
        const user = await this._userModel.findById(id);
        if (user) {
          // if stripe customer id exists then delete the stripe customer
          if (user) {
            await this._userModel.findByIdAndUpdate(id, {
              strikeCount: req.body.strikeCount,
            });
          }
          return res
            .status(200)
            .send({ success: true, message: `strike count updated.` });
        } else {
          return res
            .status(404)
            .send({ success: false, message: `User not Found.` });
        }
      } else {
        return res.status(500).send({
          success: false,
          message: 'User Id not provided or invalid user id.',
        });
      }
    } catch (error) {
      return res.status(500).send({
        success: false,
        message: `There was an error fetching the user by Id. ${error}`,
      });
    }
  }

  /**
   * update strikes for users
   * @param {Request} req - Express request object
   * @param {Request} res - Express Response Object
   * */
  public async updatePaymentDue(req: Request, res: Response) {
    try {
      const id = req.params.userId;
      if (id) {
        const user = await this._userModel.findById(id);
        if (user) {
          // if stripe customer id exists then delete the stripe customer
          if (user) {
            await this._userModel.findByIdAndUpdate(id, {
              paymentDue: req.body.paymentDue,
            });
          }
          return res
            .status(200)
            .send({ success: true, message: `strike count updated.` });
        } else {
          return res
            .status(404)
            .send({ success: false, message: `User not Found.` });
        }
      } else {
        return res.status(500).send({
          success: false,
          message: 'User Id not provided or invalid user id.',
        });
      }
    } catch (error) {
      return res.status(500).send({
        success: false,
        message: `There was an error fetching the user by Id. ${error}`,
      });
    }
  }

  /**
   * checks whether user has any ongoing or upcoming trips as vessel owner or renter
   * @param {Request} req - Express request object
   * @param {Request} res - Express Response Object
   * @param next
   * */
  public async checkUserTripsStatusForDelete(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const id = res.locals.user?.id ? res.locals.user?.id : req.params.userId;
      if (id) {
        const user = await this._userModel.findById(id);
        if (user) {
          const trips = await this._tripModel.find({
            $or: [
              {
                vesselOwner: user?._id,
                $or: [{ status: 'UPCOMING' }, { status: 'ONGOING' }],
              },
              {
                renter: user?._id,
                $or: [{ status: 'UPCOMING' }, { status: 'ONGOING' }],
              },
            ],
          });

          if (trips && trips?.length !== 0) {
            return res.status(409).send({
              success: false,
              message: `User has upcoming or ongoing trips.`,
            });
          } else {
            if (user?.paymentDue > 0) {
              return res
                .status(409)
                .send({ success: false, message: `User has payment due's.` });
            } else {
              next();
              return;
            }
          }
        } else {
          return res
            .status(404)
            .send({ success: false, message: `User not Found.` });
        }
      } else {
        return res.status(500).send({
          success: false,
          message: 'User Id not provided or invalid user id.',
        });
      }
    } catch (error) {
      return res.status(500).send({
        success: false,
        message: `There was an error fetching the user by Id. ${error}`,
      });
    }
  }

  public async checkIfUserCanDeleteAccount(req: Request, res: Response) {
    return res
      .status(200)
      .send({ success: true, message: 'User Account Can be deleted.' });
  }
}
