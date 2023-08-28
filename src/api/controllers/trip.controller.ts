import {NextFunction, Request, Response} from 'express';
import TripModel from '../models/trip.model';
import VesselModel from '../models/vessel.model';
import UserModel from "../models/user.model";
import CryptoJS from "crypto-js";
import NotificationsModel from '../models/notifications.model';
import EventModel from "../models/event.model";
import IdentityVerificationRecordModel from "../models/IdentityVerificationRecord.model";
import EmailController from "./email.controller";

export default class TripController {
  private _tripModel = TripModel.getInstance().getModel();
  private _vesselModel = VesselModel.getInstance().getModel();
  private _userModel = UserModel.getInstance().getModel();
  private _eventModel = EventModel.getInstance().getModel();
  private _notificationsModel = NotificationsModel.getInstance().getModel();
  private _identityVerificationRecordModel =
    IdentityVerificationRecordModel.getInstance().getModel();
  private static _TRIP_VERIFICATION_SECRET: string;

  constructor() {
    if (!process.env.TRIP_VERIFICATION_SECRET)
      throw 'Error: TRIP_VERIFICATION_SECRET not set';
    TripController._TRIP_VERIFICATION_SECRET =
      process.env.TRIP_VERIFICATION_SECRET;
  }

  public async getTrip(req: Request, res: Response) {
    const tripId = req.params.id;
    const userId = res.locals.user.id;
    try {
      const trip = await this._tripModel
        .findById(tripId)
        .lean()
        .populate('vessel')
        .populate('vesselOwner', 'firstName lastName')
        .populate('renter', 'firstName lastName')
        .select(
          '-paymentIntent -securityDepositPaymentIntent -paymentMethod -transferGroup'
        );

      if (
        (trip && userId.toString() === trip.renter._id.toString()) ||
        (trip && userId.toString() === trip.vesselOwner._id.toString())
      ) {
        return res.status(200).send(trip);
      } else {
        return res
          .status(404)
          .send({ success: false, message: 'Trip not found' });
      }
    } catch (error) {
      return res.status(500).send({ success: false, message: error });
    }
  }

  public async getTripsByStatusRenter(req: Request, res: Response) {
    const status = req.params.status;
    const userId = res.locals.user.id;
    try {
      console.log(userId);
      const trips = await this._tripModel
        .find({
          renter: userId,
          status: status,
        })
        .lean()
        .populate('vessel')
        .populate('vesselOwner', 'firstName lastName')
        .select(
          '-paymentIntent -securityDepositPaymentIntent -paymentMethod -transferGroup'
        );
      if (trips.length > 0) {
        // let validTrip = []
        // trips.forEach(trip => {
        //     if (userId.toString() === trip.renterId.toString()) {
        //         validTrip.push(trip);
        //     }
        // })
        return res.status(200).send(trips);
      } else {
        return res.status(200).send([]);
      }
    } catch (error) {
      console.log('error: ', error);
      return res.status(500).send(error);
    }
  }

  public async getCancelledTripsAdmin(req: Request, res: Response) {
    try {
      const trips = await this._tripModel
        .find({
          $or: [
            { canceledByVesselOwner: true },
            { canceledByRenter: true },
            { rejectedByVesselOwner: true },
          ],
        })
        .lean()
        .populate('renter', 'firstName lastName email')
        .select(
          '-paymentIntent -securityDepositPaymentIntent -paymentMethod -transferGroup'
        )
        .populate('vessel')
        .populate('vesselOwner', 'firstName lastName email')
        .select(
          '-paymentIntent -securityDepositPaymentIntent -paymentMethod -transferGroup'
        );
      if (trips.length > 0) {
        return res.status(200).send(trips);
      } else {
        return res
          .status(404)
          .send({ success: false, message: 'No Trips are canceled' });
      }
    } catch (error) {
      console.log('error: ', error);
      return res.status(500).send(error);
    }
  }

  public async resolveTripAdmin(req: Request, res: Response): Promise<any> {
    try {
      const tripId = req.params.id;
      const resolved = req.body.resolved;
      await this._tripModel.findByIdAndUpdate(tripId, { resolved: resolved });
      const trips = await this._tripModel
        .find({
          $or: [
            { canceledByVesselOwner: true },
            { canceledByRenter: true },
            { rejectedByVesselOwner: true },
          ],
        })
        .lean()
        .populate('renter', 'firstName lastName email')
        .select(
          '-paymentIntent -securityDepositPaymentIntent -paymentMethod -transferGroup'
        )
        .populate('vessel')
        .populate('vesselOwner', 'firstName lastName email')
        .select(
          '-paymentIntent -securityDepositPaymentIntent -paymentMethod -transferGroup'
        );

      return res.status(200).send(trips);
    } catch (error) {
      console.log('error: ', error);
      return res.status(500).send(error);
    }
    return null;
  }

  public async getTripsByStatusVesselOwner(req: Request, res: Response) {
    const status = req.params.status;
    const userId = res.locals.user.id;
    try {
      const trips = await this._tripModel
        .find({
          vesselOwner: userId,
          status: status,
        })
        .lean()
        .populate('vessel')
        .populate('renter', 'firstName lastName')
        .select(
          '-paymentIntent -securityDepositPaymentIntent -paymentMethod -transferGroup'
        );
      if (trips.length > 0) {
        if (status === 'OFFER') {
          await this._notificationsModel.findOneAndUpdate(
            { user: userId },
            {
              user: userId,
              trips: 0,
            },
            { upsert: true }
          );
        }
        return res.status(200).send(trips);
      } else {
        return res.status(200).send([]);
      }
    } catch (error) {
      return res.status(500).send(error);
    }
  }

  public async cancelTrip(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    const tripId = req.body.tripId;
    const cancelReason = req.body.cancelReason;
    const userId = res.locals.user.id;
    try {
      const trip = await this._tripModel.findById(tripId);
      if (trip) {
        res.locals.trip = trip;
        if (trip?.bookingStartDate && trip?.bookingStartDate > new Date()) {
          const status = trip?.status;
          const diff = trip.bookingStartDate.getTime() - new Date().getTime();
          const days = diff / 86400000;
          const hours = diff / 3600000;
          let totalAmount = Number(trip?.totalPrice);
          trip?.taxRates?.forEach((rt: any) => {
            if (rt?.amount) {
              totalAmount += rt?.amount;
            }
          });
          const applicationFees = Number(trip?.serviceFees);
          const totalAmountToCharge = Math.round(totalAmount * 0.5 * 100);
          const totalApplicationFees = applicationFees * 0.5 * 100;
          res.locals.refundAmount = Math.round(totalAmountToCharge);
          res.locals.applicationFeesRefundAmount = 0;
          res.locals.secondHalfRefund = 0;
          res.locals.secondHalfRefund = 0;
          res.locals.vsselOwnerPaymentDue = 0;
          if (userId.toString() === trip.renter.toString()) {
            if (status === 'OFFER') {
              const deletedTrip = await this._tripModel.findByIdAndDelete({
                _id: tripId,
              });
              // const updatedTrip = await this._tripModel.findByIdAndUpdate({_id: tripId}, {
              //     canceledByRenter: true,
              //     tripStatus: 'CANCELLED',
              //     cancelReason: cancelReason,
              //     refundStatus: 'noRefundRequired',
              //     status: 'PAST'
              // }, {new: true});
              return res
                .status(200)
                .send({ success: true, message: 'Trip Removed!' });
            } else if (status === 'UPCOMING') {
              res.locals.tripPayload = {
                canceledByRenter: true,
                tripStatus: 'CANCELLED',
                cancelReason: cancelReason,
                refundStatus: '',
                status: 'PAST',
              };
              if (days > 7) {
                res.locals.applicationFeesRefundAmount = Math.round(
                  totalApplicationFees * 0.5
                );
              } else if (days >= 2 && days <= 7) {
                res.locals.applicationFeesRefundAmount = Math.round(
                  totalApplicationFees * 0.25
                );
              } else if (hours <= 48 && hours >= 0) {
                res.locals.applicationFeesRefundAmount = 0;
                const refundValue = totalAmountToCharge * 0.75;
                res.locals.refundAmount = Math.round(refundValue);
              } else {
                res.locals.refundAmount = 0;
              }
              const renter = await this._userModel.findById(
                trip?.renter?.toString()
              );
              res.locals.renter = renter;
              next();
            } else if (status === 'ONGOING') {
              res.locals.refundAmount = 0;
              res.locals.applicationFeesRefundAmount = 0;
              const updatedTrip = await this._tripModel.findByIdAndUpdate(
                { _id: tripId },
                {
                  canceledByVesselOwner: false,
                  tripStatus: 'CANCELLED',
                  cancelReason: cancelReason,
                  refundStatus: 'NoRefundIssued',
                  status: 'PAST',
                },
                { new: true }
              );
              return res
                .status(200)
                .send({
                  success: true,
                  message:
                    'No Refund Issues because cancelled during trip was Ongoing.',
                })
                .end();
            } else {
              return res.status(500).send({
                success: false,
                message: 'Invalid trip status to cancel.',
              });
            }
            // if (updatedTrip) {
            //     return res.status(200).send(updatedTrip);
            // } else {
            //     return res.status(404).send({success: false, message: 'Invalid trip id.'});
            // }
          } else if (userId.toString() === trip.vesselOwner.toString()) {
            if (status === 'OFFER') {
              const updatedTrip = await this._tripModel.findByIdAndUpdate(
                { _id: tripId },
                {
                  canceledByVesselOwner: true,
                  tripStatus: 'CANCELLED',
                  cancelReason: cancelReason,
                  refundStatus: 'NoRefundRequired',
                  status: 'PAST',
                },
                { new: true }
              );
              return res.status(200).send(updatedTrip);
            } else if (status === 'UPCOMING') {
              res.locals.tripPayload = {
                canceledByVesselOwner: true,
                tripStatus: 'CANCELLED',
                cancelReason: cancelReason,
                refundStatus: '',
                status: 'PAST',
              };
              if (days > 7) {
                res.locals.applicationFeesRefundAmount = Math.round(
                  totalApplicationFees * 0.5
                );
                res.locals.vsselOwnerPaymentDue = Math.round(
                  totalApplicationFees * 0.5
                );
              } else if (days >= 2 && days <= 7) {
                res.locals.applicationFeesRefundAmount = Math.round(
                  totalApplicationFees * 0.25
                );
                res.locals.vsselOwnerPaymentDue = Math.round(
                  totalApplicationFees * 0.75
                );
              } else if (hours <= 48 && hours >= 0) {
                res.locals.applicationFeesRefundAmount = 0;
                res.locals.vsselOwnerPaymentDue =
                  Math.round(totalApplicationFees);
              }
              const renter = await this._userModel.findById(
                trip?.renter?.toString()
              );
              res.locals.renter = renter;
              next();
            } else if (status === 'ONGOING') {
              res.locals.applicationFeesRefundAmount = 0;
              res.locals.secondHalfRefund = Math.round(totalAmountToCharge);
              res.locals.vsselOwnerPaymentDue = Math.round(
                applicationFees * 100
              );
              next();
            } else {
              return res.status(500).send({
                success: false,
                message: 'Invalid trip status to cancel.',
              });
            }

            // const updatedTrip = await this._tripModel.findByIdAndUpdate({_id: tripId},
            //     {
            //         tripStatus: 'CANCELLED',
            //         cancelReason: cancelReason,
            //         status: 'PAST',
            //         canceledByVesselOwner: true,
            //         refundStatus: 'RefundInitiated',
            //     }, {new: true});
            // if (updatedTrip) {
            //     return res.status(200).send(updatedTrip);
            // } else {
            //     return res.status(404).send({success: false, message: 'Invalid trip id.'});
            // }
          } else {
            return res
              .status(404)
              .send({ success: false, message: 'Invalid ids.' });
          }
        } else {
          return res.status(500).send({
            success: false,
            message: 'Cannot cancel/reject past trip',
          });
        }
      } else {
        return res
          .status(500)
          .send({ success: false, message: 'Trip was not found' });
      }
    } catch (error) {
      return res.status(500).send(error);
    }
    return null
  }

  public async acceptOfferTrip(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    const tripId = req.body.tripId;
    const userId = res.locals.user.id;
    try {
      const trip = await this._tripModel.findById(tripId);
      if (trip) {
        const vesselId = trip?.vessel;
        const startDate = trip?.bookingStartDate;
        const endDate = trip?.bookingEndDate;
        if (trip?.bookingStartDate && trip?.bookingStartDate > new Date()) {
          if (userId.toString() === trip.vesselOwner.toString()) {
            const existingEvents = await this._eventModel.find({
              vessel: vesselId,
              $or: [
                { start: { $gte: startDate }, end: { $lte: endDate } },
                { start: { $lt: endDate }, end: { $gte: endDate } },
                { end: { $gt: startDate }, start: { $lte: startDate } },
              ],
            });
            if (existingEvents.length > 0) {
              return res.status(409).send({
                isBooked: false,
                message: 'Another trip is already scheduled for this timeslot',
              });
            } else {
              const renter = await this._userModel.findById(
                trip?.renter?.toString()
              );
              const usr = await this._userModel.findById(userId);
              res.locals.renter = renter;
              res.locals.trip = trip;
              res.locals.user = usr;
              next();
            }
          } else {
            return res
              .status(404)
              .send({ success: false, message: 'Invalid user id.' })
              .end();
          }
        } else {
          return res
            .status(500)
            .send({
              success: false,
              message: 'Cannot accept a trip offer that is in the past.',
            })
            .end();
        }
      } else {
        return res
          .status(500)
          .send({ success: false, message: 'Trip was not found' })
          .end();
      }
    } catch (error) {
      return res.status(500).send(error).end();
    }
    return null;
  }

  public async updateTripAfterAcceptPayment(req: Request, res: Response) {
    try {
      if (res.locals.trip._id) {
        const vesselId = res.locals.trip?.vessel;
        const startDate = res.locals.trip?.bookingStartDate;
        const endDate = res.locals.trip?.bookingEndDate;
        // generate a randomised 6-digit number
        const randomStartVerificationCode = Math.floor(
          1000 + Math.random() * 9000
        );
        const randomEndVerificationCode = Math.floor(
          1000 + Math.random() * 9000
        );
        const startVerificationCode = CryptoJS.AES.encrypt(
          `${randomStartVerificationCode}`,
          TripController._TRIP_VERIFICATION_SECRET
        ).toString();
        const endVerificationCode = CryptoJS.AES.encrypt(
          `${randomEndVerificationCode}`,
          TripController._TRIP_VERIFICATION_SECRET
        ).toString();
        // console.log(randomStartVerificationCode);
        // const bytes = CryptoJS.AES.decrypt(startVerificationCode, TripController._TRIP_VERIFICATION_SECRET);
        // console.log(bytes.toString(CryptoJS.enc.Utf8));
        // save the stripe payment intent and transfer group used for future tranfers to vessel owner
        const updatedTrip = await this._tripModel.findByIdAndUpdate(
          res.locals.trip._id,
          {
            offerAccepted: true,
            status: 'UPCOMING',
            paymentIntent: res.locals.paymentIntent,
            transferGroup: res.locals.transferGroup,
            startVerificationCode: startVerificationCode,
            endVerificationCode: endVerificationCode,
            applicationFees: res.locals.applicationFeesId,
          },
          { new: true }
        );
        const newEvent = new this._eventModel({
          eventType: 'BOOKED',
          start: res.locals.trip.bookingStartDate,
          end: res.locals.trip.bookingEndDate,
          vessel: res.locals.trip.vessel,
          modifiedBy: res.locals.user.id,
          createdBy: res.locals.user.id,
          userDetails: res.locals.trip.renter,
          trip: res.locals.trip._id,
        });
        await newEvent.save();
        const existingTrip = await this._tripModel.find({
          _id: { $ne: res.locals.tripe?._id.toString() },
          $or: [
            {
              bookingStartDate: { $gte: startDate },
              bookingEndDate: { $lte: endDate },
            },
            {
              bookingStartDate: { $lt: endDate },
              bookingEndDate: { $gte: endDate },
            },
            {
              bookingEndDate: { $gt: startDate },
              bookingStartDate: { $lte: startDate },
            },
          ],
        });
        // remove trips that are asking for same timeslot
        if (existingTrip && existingTrip?.length > 0) {
          await Promise.all(
            existingTrip?.map(async (t) => {
              if (
                t?._id.toString() !== res.locals.trip._id.toString() &&
                t?.status === 'OFFER'
              ) {
                const cancelTripPayload = {
                  canceledByRenter: false,
                  tripStatus: 'CANCELLED',
                  cancelReason:
                    'Cancelled because another trip accepted in this timeslot',
                  refundStatus: 'NoRefundRequired',
                  status: 'PAST',
                };
                await this._tripModel.findByIdAndUpdate(
                  t?._id,
                  cancelTripPayload
                );
              }
            })
          );
        }
        return res.status(200).send({
          success: true,
          message: 'trip accepted',
          tripId: res.locals.trip?._id,
        });
      } else {
        return res
          .status(500)
          .send({ success: false, message: 'Trip was not found' })
          .end();
      }
    } catch (error) {
      return res.status(500).send(error).end();
    }
  }

  public async rejectOfferTrip(req: Request, res: Response) {
    const tripId = req.body.tripId;
    const reasonReject = req.body.rejectReason;
    const userId = res.locals.user.id;
    try {
      const trip = await this._tripModel.findById(tripId);
      if (trip) {
        if (userId.toString() === trip.vesselOwner.toString()) {
          const updatedTrip = await this._tripModel.findByIdAndUpdate(tripId, {
            rejectedByVesselOwner: true,
            rejectReason: reasonReject,
            canceledByVesselOwner: true,
            tripStatus: 'CANCELLED',
            refundStatus: 'NoRefundRequired',
            status: 'PAST',
          });
          if (updatedTrip) {
            return res
              .status(200)
              .send({ success: true, message: 'trip rejected' });
          } else {
            return res
              .status(404)
              .send({ success: false, message: 'Invalid trip id.' });
          }
        } else {
          return res
            .status(404)
            .send({ success: false, message: 'Invalid ids.' });
        }
      } else {
        return res
          .status(500)
          .send({ success: false, message: 'Trip was not found' });
      }
    } catch (error) {
      return res.status(500).send(error);
    }
  }

  public async startTrip(req: Request, res: Response) {
    const tripId = req.body.tripId;
    const userId = res.locals.user.id;
    try {
      console.log('req.body', req.body);
      console.log('tripId', tripId);
      const trip = await this._tripModel.findById(tripId);
      console.log('trip: ', trip);
      if (trip) {
        if (userId.toString() === trip.renter.toString()) {
          const updatedVessel = await this._vesselModel.findByIdAndUpdate(
            trip.vessel,
            { $inc: { noOfBookings: 1 } }
          );
          const user = await this._userModel.findById(userId);

          // Verify verification code as well for renter
          const updatedTrip = await this._tripModel.findByIdAndUpdate(
            { _id: tripId },
            {
              status: 'ONGOING',
              secondHalfApplicationFees: res.locals?.secondApplicationFeesId,
            },
            { new: true }
          );
          if (updatedTrip) {
            const adminEmails = await this.getAdminUsers();
            EmailController.sendTripStatusChangeEmailToAdmin({
              adminEmails: adminEmails,
              userEmail: user?.email ? user?.email : '',
              subject: 'New Trip Started',
              preHeader: 'New Trip Started',
              message: 'New Trip Started By',
              userName: `${user?.firstName ? user?.firstName : ''} ${
                user?.lastName ? user?.lastName : ''
              }`,
              status: updatedTrip?.status ? updatedTrip?.status : '',
              tripId: trip?._id ? trip?._id : '',
            });
            return res.status(200).send(updatedTrip);
          } else {
            return res
              .status(404)
              .send({ success: false, message: 'Invalid trip id.' });
          }
        } else {
          return res
            .status(404)
            .send({ success: false, message: 'Invalid ids.' });
        }
      } else {
        return res
          .status(500)
          .send({ success: false, message: 'Trip was not found' });
      }
    } catch (error) {
      return res.status(500).send(error);
    }
  }

  public async endTrip(req: Request, res: Response) {
    const tripId = req.body.tripId;
    const userId = res.locals.user.id;
    try {
      const trip = await this._tripModel.findById(tripId);
      if (trip) {
        if (userId.toString() === trip.vesselOwner.toString()) {
          const curDate = new Date();
          // Verify verification code as well for vessel owner
          const updatedTrip = await this._tripModel.findByIdAndUpdate(
            { _id: tripId },
            {
              status: 'PAST',
              tripStatus: 'COMPLETED',
              removeSecurityHoldAfter: new Date(
                curDate.getTime() + 48 * 60 * 60 * 1000
              ),
            },
            { new: true }
          );
          const user = await this._userModel.findById(userId);
          if (updatedTrip) {
            const adminEmails = await this.getAdminUsers();
            EmailController.sendTripStatusChangeEmailToAdmin({
              adminEmails: adminEmails,
              userEmail: user?.email ? user?.email : '',
              subject: 'Trip Ended',
              preHeader: 'Trip Ended',
              message: 'Trip Ended By',
              userName: `${user?.firstName ? user?.firstName : ''} ${
                user?.lastName ? user?.lastName : ''
              }`,
              status: updatedTrip?.status ? updatedTrip?.status : '',
              tripId: trip?._id ? trip?._id : '',
            });
            return res.status(200).send(updatedTrip);
          } else {
            return res
              .status(404)
              .send({ success: false, message: 'Invalid trip id.' });
          }
        } else {
          return res
            .status(404)
            .send({ success: false, message: 'Invalid ids.' });
        }
      } else {
        return res
          .status(500)
          .send({ success: false, message: 'Trip was not found' });
      }
    } catch (error) {
      return res.status(500).send(error);
    }
  }

  public async createTripOffer(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const vesselId = req.body.vesselId;
    const userId = res.locals.user.id;
    if (
      res.locals?.pricing?.pricingDetails &&
      (req.body.paymentMethodId || req.body.tokenId) &&
      res.locals.vessel
    ) {
      try {
        if (
          (res.locals.end.getTime() - res.locals.start.getTime()) / 604800000 <=
          3
        ) {
          const vessel = res.locals.vessel;
          req.body.vessel = vessel?._id;
          req.body.renter = userId;
          req.body.vesselOwner = vessel?.userId;
          req.body.totalPrice = res.locals.pricing.pricingDetails.total;
          req.body.securityDeposit =
            res.locals.pricing.pricingDetails.minimumDeposit;
          req.body.serviceFees = res.locals.pricing.pricingDetails.serviceFees;
          req.body.bookingDate = new Date();
          req.body.bookingStartDate = res.locals.start;
          req.body.bookingEndDate = res.locals.end;
          req.body.paymentMethodId &&
            (req.body.paymentMethod = req.body.paymentMethodId);
          req.body.tokenId && (req.body.paymentToken = req.body.tokenId);
          // req.body.taxAmount = res.locals.taxAmount;
          // req.body.taxPercentage = res.locals.taxPercentage;
          req.body.taxRates = res.locals.taxRates;
          let totalWithTaxes = res.locals.pricing.pricingDetails.total;
          res.locals?.taxRates.forEach((rate: any) => {
            if (rate?.amount) {
              totalWithTaxes += rate?.amount;
            }
          });
          req.body.displayAmount = totalWithTaxes;
          const newTrip = new this._tripModel(req.body);
          const savedTrip = await newTrip.save();

          // const notification = await this._notificationsModel.findOne({user: vessel.userId});
          // await this._notificationsModel.findOneAndUpdate({user: vessel.userId}, {
          // user: vessel.userId,
          // trips: notification?.trips ? notification?.trips + 1 : 1
          // }, {upsert: true});
          return res.status(200).send({
            success: true,
            message: 'trip booked',
            tripId: savedTrip?._id,
          });
        } else {
          return res.status(500).send({
            success: false,
            message: 'Cannot book trip for more than 3 weeks.',
          });
        }
      } catch (err) {
        return res.status(500).send({
          success: false,
          message: `There was an error booking the vessel ${err}`,
        });
      }
    } else {
      return res.status(500).send({
        success: false,
        message: 'There was an error booking the vessel',
      });
    }
    // const newModel = new this._tripModel(req.body);
    // await newModel.save((err, model: Document) => {
    //     if (err) return res.status(500).send(err);
    //     return res.json(model);
    // });
  }

  // temporary method to create testing bookings
  public async createTempBooking(req: Request, res: Response) {
    const vesselId = req.body.vesselId;
    if (vesselId) {
      try {
        req.body.vessel = vesselId;
        req.body.renter = req.body.renterId;
        req.body.vesselOwner = req.body.vesselOwnerId;
        req.body.totalPrice = req.body.paidFees;
        const newTrip = new this._tripModel(req.body);
        const savedTrip = await newTrip.save();
        return res.status(200).send(savedTrip);
      } catch (err) {
        return res.status(500).send({
          success: false,
          message: `There was an error booking the vessel ${err}`,
        });
      }
    } else {
      return res.status(500).send({
        success: false,
        message: 'There was an error booking the vessel',
      });
    }
    // const newModel = new this._tripModel(req.body);
    // await newModel.save((err, model: Document) => {
    //     if (err) return res.status(500).send(err);
    //     return res.json(model);
    // });
  }

  public async updateAfterRefund(req: Request, res: Response) {
    const tripId = req.body.tripId;
    try {
      res.locals.tripPayload.refundStatus = 'RefundProcessed';
      if (res.locals?.refund?.status === 'succeeded') {
        res.locals.tripPayload.refundStatus = 'RefundProcessed';
      }
      if (res.locals?.secondHalfrefund?.status === 'succeeded') {
        res.locals.tripPayload.refundStatus = 'RefundProcessed';
      }
      if (res.locals?.refund?.id) {
        res.locals.tripPayload.refundId = res.locals.refund?.id;
      }
      if (res.locals?.secondHalfRefund?.id) {
        res.locals.tripPayload.secondHalfRefundId =
          res.locals.secondHalfRefund?.id;
      }
      if (res.locals?.applicationFeesRefund?.id) {
        res.locals.tripPayload.applicationFeesRefundId =
          res.locals?.applicationFeesRefund?.id;
      }
      if (
        res.locals?.vsselOwnerPaymentDue !== 0 &&
        res.locals.trip?.vesselOwner?.toString() &&
        res.locals.trip?.vesselOwner?.toString() !== ''
      ) {
        await this._userModel.findByIdAndUpdate(
          res.locals.trip?.vesselOwner?.toString(),
          {
            $inc: { paymentDue: Number(res.locals.vsselOwnerPaymentDue) / 100 },
          }
        );
      }

      await this._tripModel.findByIdAndUpdate(tripId, res.locals.tripPayload);
      await this._eventModel.findOneAndDelete({ trip: tripId });
      return res.status(200).send({
        success: true,
        message: 'Trip Cancelled and Refund Initiated',
      });
    } catch (error) {
      return res.status(500).send(error);
    }
  }

  public async checkUserVerificationStatusForReserving(
    req: Request,
    res: Response
  ) {
    const userId = res.locals.user.id;
    const vesselId = req.params.vesselId;
    if (userId && vesselId) {
      const result = await this.checkUserVerificationStatusForBookingVessel(
        userId,
        vesselId
      );
      if (result?.success) {
        return res.status(200).send(result);
      } else {
        return res.status(500).send(result);
      }
    } else {
      return res.status(500).send({
        success: false,
        message: 'Please provide user token and vessel Id.',
      });
    }
  }

  public async checkUserVerificationStatusForBooking(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    const userId = res.locals.user.id;
    const vesselId = req.body.vesselId;
    if (userId && vesselId) {
      const result = await this.checkUserVerificationStatusForBookingVessel(
        userId,
        vesselId
      );
      if (result?.success) {
        next();
      } else {
        return res.status(500).send(result).end();
      }
    } else {
      return res
        .status(500)
        .send({
          success: false,
          message: 'Please provide user token and vessel Id.',
        })
        .end();
    }
  }

  public async checkUserVerificationStatusForBookingVessel(
    userId: string,
    vesselId: string
  ) {
    if (userId && vesselId) {
      try {
        const vessel = await this._vesselModel.findById(vesselId);
        if (vessel) {
          let identityStatus = 'NOT_PROVIDED';
          let vesselLicenseVerificationStatus = 'NOT_PROVIDED';
          // @ts-ignore
          const vesselType = vessel.vesselType;
          // @ts-ignore
          if (vessel?.userId.toString() === userId.toString()) {
            return {
              success: true,
              identityStatus: identityStatus,
              vesselLicenseVerificationStatus: vesselLicenseVerificationStatus,
              vesselType: vesselType,
              requiredUserDetailsProvided: false,
              isVesselOwner: true,
            };
          }
          const record = await this._identityVerificationRecordModel
            .find({ CustomerReferenceID: userId.toString() })
            .lean();
          // @ts-ignore
          if (record?.length > 0) {
            identityStatus = 'PROVIDED';
            // @ts-ignore
            if (record[0] && record[0]?.Record?.RecordStatus === 'match') {
              identityStatus = 'VERIFIED';
            }
          }
          if (vesselType === 'RENTAL') {
            const userDocuments = await this._userModel
              .findById(userId)
              .populate('documents')
              .select('documents');
            // @ts-ignore
            if (userDocuments?.documents?.length == 2) {
              // @ts-ignore
              console.log(userDocuments?.documents?.length);
              vesselLicenseVerificationStatus = 'PROVIDED';
              // @ts-ignore
              console.log(userDocuments?.documents[1]);
              // @ts-ignore
              if (
                userDocuments?.documents[0].isVerified &&
                userDocuments?.documents[1].isVerified
              ) {
                // @ts-ignore
                console.log(
                  userDocuments?.documents[0].isVerified,
                  userDocuments?.documents[0].isVerified
                );
                vesselLicenseVerificationStatus = 'VERIFIED';
              }
            }
          }
          let requiredUserDetailsCompleted = false;
          const user = await this._userModel.findById(userId);
          if (!!user?.gender && !!user?.dateOfBirth) {
            requiredUserDetailsCompleted = true;
          }
          return {
            success: true,
            identityStatus: identityStatus,
            vesselLicenseVerificationStatus: vesselLicenseVerificationStatus,
            vesselType: vesselType,
            requiredUserDetailsProvided: requiredUserDetailsCompleted,
            isVesselOwner: false,
          };
        } else {
          return { success: false, message: 'Vessel Not Found.' };
        }
      } catch (error) {
        return {
          success: false,
          message: `There was an error while fetching status ${error}`,
        };
      }
    } else {
      return {
        success: false,
        message: 'Please provide user token and vessel Id.',
      };
    }
  }

  public async checkTripStartValidity(req: Request, res: Response) {
    const tripId = req.params.tripId;
    const hours = req.query.hourlyInterval || 2;
    const millisecondsDifference = Number(hours) * 3600000;

    if (!tripId) {
      return res
        .status(404)
        .send({ success: false, message: 'Invalid trip Id provided.' });
    }

    const trip = await this._tripModel.findById(tripId);

    if (!trip || !trip?.bookingStartDate) {
      return res.status(500).send({ success: false, message: 'Invalid Trip.' });
    }

    const tripStartDate = trip?.bookingStartDate;
    const currentDate = new Date();

    console.log(tripStartDate.getTime() - currentDate.getTime());
    if (
      tripStartDate.getTime() - currentDate.getTime() <=
      millisecondsDifference
    ) {
      return res.status(200).send({ canStart: true });
    }

    return res.status(200).send({ canStart: false });
  }

  public async checkTripStatusOfVesselUnpublished(req: Request, res: Response) {
    const vesselId = req.params.vesselId;
    if (vesselId) {
      const foundTrips = await this._tripModel.find({
        vessel: vesselId.toString(),
        $or: [{ status: 'UPCOMING' }, { status: 'ONGOING' }],
      });
      if (foundTrips && foundTrips?.length !== 0) {
        return res.status(200).send({ success: true, tripsActive: true });
      } else {
        return res.status(200).send({ success: true, tripsActive: false });
      }
    } else {
      return res
        .status(500)
        .send({ success: false, message: 'No vessel Id Provided.' });
    }
  }

  /**
   * Get user trips history by user id
   * @param {Request} req - Express request object
   * @param {Request} res - Express Response Object
   * */
  public async getUserTripsHistory(req: Request, res: Response) {
    try {
      const id = req.params.userId;
      if (id) {
        const trips = await this._tripModel
          .find({
            $or: [{ vesselOwner: id.toString() }, { renter: id.toString() }],
          })
          .select(
            '-paymentIntent -securityDepositPaymentIntent -secondHalfPaymentIntent -paymentMethod -transferGroup -paymentToken -applicationFees -secondHalfApplicationFees -refundId -secondHalfRefundId -applicationFeesRefundId -secondHalfApplicationFeesRefundId -securityDepositExpiresOn -startVerificationCode -endVerificationCode'
          )
          .populate('vesselOwner', 'firstName lastName')
          .populate('renter', 'firstName lastName')
          .populate('vessel', 'title vesselBrand vesselAddress vesselType');
        return res.status(200).send(trips);
      } else {
        return res
          .status(500)
          .send({ success: false, message: 'User Id not provided.' });
      }
    } catch (error) {
      return res.status(500).send({
        success: false,
        message: `There was an error fetching the user history. ${error}`,
      });
    }
  }

  async getAdminUsers() {
    try {
      const adminUsers = await this._userModel
        .find({ $or: [{ userType: 'ADMIN' }, { userType: 'PSEUDO_ADMIN' }] })
        .select('email');
      if (adminUsers && adminUsers?.length !== 0) {
        return adminUsers?.map((au) => au?.email);
      } else {
        return [];
      }
    } catch (err) {
      console.log('error getting admin users', err);
      return [];
    }
  }
}
