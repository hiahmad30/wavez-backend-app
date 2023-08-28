/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import {NextFunction, Request, Response} from 'express';
import jwt from 'jsonwebtoken';
import UserModel from '../models/user.model';
import InvalidTokenModel from '../models/invalidToken.model';
import bcrypt from 'bcryptjs';
import * as crypto from "crypto";
import NotificationsModel from '../models/notifications.model';
import util from 'util';
export default class LoginController {
  private static _JWT_SECRET: string;
  private static _JWT_SALT: string;
  private static _JWT_EXPIRES_IN: string;
  private static _ADMIN_EMAIL: string;
  private static _ADMIN_PASSWORD: string;
  private static _SET_PASSWORD_JWT: string;
  private static _BIOMETRIC_SIGNATURE_KEY: string;
  private static _BIOMETRIC_JWT_SECRET: string;
  private _userModel = UserModel.getInstance().getModel();
  private _invalidTokenModel = InvalidTokenModel.getInstance().getModel();

  constructor() {
    if (!process.env.JWT_EXPIRES_IN) throw 'Error: JWT_EXPIRES_IN not set';
    LoginController._JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;
    if (!process.env.JWT_SECRET) throw 'Error: JWT_SECRET not set';
    LoginController._JWT_SECRET = process.env.JWT_SECRET;
    if (!process.env.JWT_SALT) throw 'Error: JWT_SALT not set';
    LoginController._JWT_SALT = process.env.JWT_SALT;
    if (!process.env.ADMIN_EMAIL) throw 'Error: ADMIN_EMAIL not set';
    LoginController._ADMIN_EMAIL = process.env.ADMIN_EMAIL;
    if (!process.env.ADMIN_PASSWORD) throw 'Error: ADMIN_PASSWORD not set';
    LoginController._ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
    if (!process.env.SET_PASSWORD_JWT) throw 'Error: SET_PASSWORD_JWT not set';
    LoginController._SET_PASSWORD_JWT = process.env.SET_PASSWORD_JWT;
    if (!process.env.BIOMETRIC_SIGNATURE_KEY)
      throw 'Error: BIOMETRIC_SIGNATURE_KEY not set';
    LoginController._BIOMETRIC_SIGNATURE_KEY =
      process.env.BIOMETRIC_SIGNATURE_KEY;
    if (!process.env.BIOMETRIC_JWT_SECRET)
      throw 'Error: BIOMETRIC_JWT_SECRET not set';
    LoginController._BIOMETRIC_JWT_SECRET = process.env.BIOMETRIC_JWT_SECRET;
  }

  public createToken(req: Request, res: Response): void {
    const email = req.body.email;
    const password = req.body.password;
    // console.log(email, password);
    let isAdmin = false;
    let isPseudoAdmin = false;
    if (LoginController._ADMIN_EMAIL && LoginController._ADMIN_PASSWORD) {
      if (
        LoginController._ADMIN_EMAIL.toLowerCase() === email.toLowerCase() &&
        LoginController._ADMIN_PASSWORD === password
      ) {
        isAdmin = true;
        const token = jwt.sign(
          {
            email: email,
            isAdmin: isAdmin,
            isPseudoAdmin: isPseudoAdmin,
            id: null,
          },
          LoginController._JWT_SECRET
        );
        res.json({
          success: true,
          message: 'Authentication successful!',
          token: token,
          isAdmin: isAdmin,
          isPseudoAdmin: isPseudoAdmin,
          userInitials: 'AD',
          theme: 'LIGHT',
          IsVesselOwner: false,
        });
        console.log(token, 'token');
        // this._userModel.findOne({email: email}, (err: never, model: Document) => {
        //     if (err) res.status(500).send(err);
        //     console.log(model)
        //     // @ts-ignore
        //     if (model.userType === 'PSEUDO_ADMIN') {
        //         isPseudoAdmin = true;
        //     }
        // });
      } else {
        //check DB
        this._userModel.findOne(
          { email: email.toLowerCase() },
          function (
            err: never,
            user: {
              email: string;
              password: string;
              _id: unknown;
              playerIds?: object;
              userType: string;
              firstName?: string;
              lastName?: string;
              profileImageUrl?: string;
              isVesselOwner?: boolean;
              disabled?: boolean;
              theme?: string;
            }
          ) {
            if (err) return res.status(500).send(err);
            if (!user)
              return res.status(404).send({
                success: false,
                message: 'Invalid Email ID or Password',
              });
            if (!user?.password)
              return res.status(401).send({
                success: false,
                message: 'Email Not Verified.',
              });
            if (user?.disabled) {
              return res.status(401).send({
                success: false,
                message: 'Account Disabled',
              });
            }
            bcrypt.compare(
              password,
              user.password,
              async function (err2, result) {
                const _notificationsModel =
                  NotificationsModel.getInstance().getModel();
                if (err2) return res.status(500).send(err2);
                if (result) {
                  const isPseudoAdmin = user.userType === 'PSEUDO_ADMIN';
                  const token = jwt.sign(
                    {
                      email: req.body.email,
                      id: user._id,
                      isAdmin: isAdmin,
                      isPseudoAdmin: isPseudoAdmin,
                    },
                    LoginController._JWT_SECRET
                  );
                  console.log(token, 'tokenLogin');
                  // Formatting the user initials
                  const userInitials = `${
                    user?.firstName ? user?.firstName.split('')[0] : ''
                  }${user?.lastName ? user?.lastName.split('')[0] : ''}`;
                  const notification = await _notificationsModel.findOne({
                    user: user._id,
                  });
                  return res.json({
                    success: true,
                    message: 'Authentication successful!',
                    token: token,
                    userId: user._id,
                    userType: user.userType,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    profileImageUrl: user.profileImageUrl,
                    isVesselOwner: user.isVesselOwner,
                    isAdmin: isAdmin,
                    isPseudoAdmin: isPseudoAdmin,
                    userInitials: userInitials,
                    playerIds: user.playerIds,
                    theme: user.theme,
                    email: user.email,
                    notification: notification,
                  });
                } else {
                  return res.status(401).send({
                    success: false,
                    message: 'Invalid Email ID or Password',
                  });
                }
              }
            );
            return;
          }
        );
      }
    }
  }

  public verifyToken(req: Request, res: Response, next: NextFunction): void {
    let token = (req.headers['x-access-token'] ||
      req.headers['authorization']) as string;
    if (token) {
      if (/^Bearer /.test(token)) {
        token = token.slice(7, token.length);
      }

      jwt.verify(token, LoginController._JWT_SECRET, (err: any, decoded) => {
        if (err) {
          return res
            .status(401)
            .send({
              success: false,
              message: `Token is invalid! \n Error:${err.message}`,
            })
            .end();
        } else {
          res.locals.user = decoded;
          next();
        }
        return null;
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Auth token is not provided',
      });
    }
  }

  public async validateSetPasswordToken(
    req: Request,
    res: Response
  ): Promise<any> {
    if (!process.env.SERVER_HOST) {
      throw new Error('SERVER_HOST not set.');
    }

    try {
      const token = req.params.token;

      // Checking if the token is in the invalid token collection and not checking it for verification
      const foundToken = await this._invalidTokenModel.findOne({ token });
      if (foundToken) {
        return res
          .status(401)
          .send({ success: false, message: 'Token is invalid!' })
          .end();
      }

      try {
        await jwt.verify(token, LoginController._SET_PASSWORD_JWT);
        return res
          .status(200)
          .send({ success: true, message: 'Token is valid!' });
      } catch (err) {
        return res
          .status(401)
          .send({ success: false, message: 'Token is invalid!' })
          .end();
      }
    } catch (error) {
      return res.status(500).send(error);
    }
  }

  /**
   * Sets a new password for the user
   * */
  public async savePassword(req: Request, res: Response): Promise<any> {
    try {
      const { password, confirmPassword } = req.body;

      if (password.trim() === '' || confirmPassword.trim() === '') {
        return res
          .status(400)
          .send('Password or Password confirmation cannot be empty.');
      }

      let token = req.headers['x-access-token'] || req.headers['authorization'];
      if (token) {
        if (Array.isArray(token)) {
          token = token[0]; // Get the first element if it's an array
        }
        if (/^Bearer /.test(token)) {
          token = token.slice(7);
        }

        const foundToken = await this._invalidTokenModel.findOne({ token });
        if (foundToken) {
          return res
            .status(401)
            .send({ success: false, message: 'Token is invalid!' });
        }

        jwt.verify(
          token as string,
          LoginController._SET_PASSWORD_JWT,
          async (err: any, decoded: { email: any }) => {
            if (err) {
              return res
                .status(401)
                .send({ success: false, message: 'Token is invalid!' });
            }

            if (password && confirmPassword && password === confirmPassword) {
              const expression = new RegExp(
                '^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,16}$'
              );
              if (expression.test(password)) {
                const hashedPassword = await bcrypt.hash(
                  password,
                  parseInt(LoginController._JWT_SALT)
                );
                const profile = await this._userModel.findOneAndUpdate(
                  { email: decoded.email },
                  { password: hashedPassword },
                  { rawResult: true }
                );

                const invalidJson = new this._invalidTokenModel({ token });
                await invalidJson.save();

                return res
                  .status(200)
                  .send({ success: true, message: 'New password saved.' });
              } else {
                return res
                  .status(500)
                  .send({ success: false, message: 'Password is not valid.' });
              }
            } else {
              return res.status(400).send({
                success: false,
                message: 'Password and Password confirmation do not match.',
              });
            }
          }
        );
      } else {
        return res
          .status(401)
          .send({ success: false, message: 'Token not provided!' });
      }
    } catch (error) {
      return res.status(500).send(error);
    }
  }

  public async biometricLogin(req: Request, res: Response): Promise<any> {
    try {
      const signature = req.body.signature;
      const userId = res.locals.user.id;

      if (!userId) {
        return res.status(404).send({
          success: false,
          message: 'UserId not present in the token.',
        });
      }

      const findByIdAsync = util.promisify(
        this._userModel.findById.bind(this._userModel)
      );

      const user = await findByIdAsync(userId);

      if (!user) {
        return res.status(404).send({
          success: false,
          message: 'Token or signature is invalid.',
        });
      }

      if (!user.biometricPublicKey) {
        return res.status(404).send({
          success: false,
          message: 'Public Key Not present for the provided user.',
        });
      }

      const formattedPublicKey = `-----BEGIN PUBLIC KEY-----\n${user.biometricPublicKey}\n-----END PUBLIC KEY-----`;
      const isVerified = crypto.verify(
        'rsa-sha256',
        Buffer.from(LoginController._BIOMETRIC_SIGNATURE_KEY),
        {
          key: formattedPublicKey,
          padding: crypto.constants.RSA_PKCS1_PADDING,
        },
        Buffer.from(signature, 'base64')
      );

      if (!isVerified) {
        return res.status(401).send({
          success: false,
          message: 'Invalid Signature for the user',
        });
      }

      const token = jwt.sign(
        { email: user.email, id: user._id, isAdmin: false },
        LoginController._JWT_SECRET
      );

      const userInitials = `${
        user?.firstName ? user?.firstName.split('')[0] : ''
      }${user?.lastName ? user?.lastName.split('')[0] : ''}`;

      return res.status(200).send({
        success: true,
        message: 'Authentication successful!',
        token: token,
        userId: user._id,
        userType: user.userType,
        userInitials: userInitials,
        theme: user.theme,
        email: user.email,
      });
    } catch (error) {
      return res.status(500).send({
        success: false,
        message: `Error while authenticating the signature.${error}`,
      });
    }

    throw new Error('End of function reached without a return statement.'); // Add this line to address the missing return statement issue
  }

  public verifySuperAdminToken = (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    const token = req.headers['x-access-token'] || req.headers['authorization'];
    if (token) {
      const tokenString = Array.isArray(token) ? token[0] : token;
      const formattedToken = tokenString.replace(/^Bearer /, '');

      jwt.verify(
        formattedToken,
        LoginController._JWT_SECRET,
        (err: any, decoded: any) => {
          if (err) {
            res.status(401).send({
              success: false,
              message: `Token is invalid! \n Error: ${err.message}`,
            });
          } else {
            if (decoded?.isAdmin) {
              next();
            } else {
              res
                .status(401)
                .send({ success: false, message: 'User Unauthorized!' });
            }
          }
        }
      );
    } else {
      res.status(401).json({
        success: false,
        message: 'Auth token is not provided',
      });
    }
  };

  public verifyAllAdminToken(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    let token = (req.headers['x-access-token'] ||
      req.headers['authorization']) as string;
    if (token) {
      if (/^Bearer /.test(token)) {
        token = token.slice(7, token.length);
      }

    try {
      const decoded = jwt.verify(token, LoginController._JWT_SECRET) as {isAdmin?:boolean,isPseudoAdmin?:boolean};

      if (decoded?.isAdmin || decoded?.isPseudoAdmin) {
        next();
      } else {
        return res
          .status(401)
          .send({ success: false, message: 'User Unauthorized!' }) as unknown as void
          
      }
    } catch (err) {
      return res.status(401).send({
        success: false,
        message: `Token is invalid! \n Error:${err.message}`,
      }) as unknown as void;
       
    }

    } else {
      res.status(401).json({
        success: false,
        message: 'Auth token is not provided',
      });
    }
  }

  public verifyBiometricToken = (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    let token = req.headers['x-access-token'] || req.headers['authorization'];
    if (token) {
      if (Array.isArray(token)) {
        token = token[0]; // Get the first element if it's an array
      }
      if (/^Bearer /.test(token)) {
        token = token.slice(7);
      }

      jwt.verify(
        token as string,
        LoginController._BIOMETRIC_JWT_SECRET,
        (err: any, decoded: any) => {
          if (err) {
            res.status(401).send({
              success: false,
              message: `Token is invalid! \n Error: ${err.message}`,
            });
          } else {
            res.locals.user = decoded;
            next();
          }
        }
      );
    } else {
      res.status(401).json({
        success: false,
        message: 'Auth token is not provided',
      });
    }
  };
}
