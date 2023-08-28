import {CronJob} from 'cron';
import UserModel from "../api/models/user.model";
import TripModel from "../api/models/trip.model";
import VesselModel from '../api/models/vessel.model';
import VesselFuelModel from "../api/models/vessel-fuel.model";
import Stripe from "stripe";

export default class CronJobConfig {

    constructor() {
        // runs every day at 3 a.m
        const job = new CronJob('0 0 3 * * *', async function () {
            // const _userModel = UserModel.getInstance().getModel();
            // const usersToDelete = await _userModel.find({ deleteBy: { $exists: true, $lte: new Date()}});
            // console.log(usersToDelete);

            const _tripModel = TripModel.getInstance().getModel();
            const _userModel = UserModel.getInstance().getModel();
            const tripsToDelete = await _tripModel.find({
                status: 'OFFER',
                bookingStartDate: {$exists: true, $lt: new Date()}
            });
            if (tripsToDelete && tripsToDelete?.length !== 0) {

                Promise.all(tripsToDelete?.map(async (t) => {
                    await _tripModel.findByIdAndDelete(t?._id);
                }));
            }

            const tripsToStopUpcoming = await _tripModel.find({
                status: 'UPCOMING',
                bookingStartDate: {$exists: true, $lt: new Date()}
            });


            if (tripsToStopUpcoming && tripsToStopUpcoming?.length !== 0) {

                Promise.all(tripsToStopUpcoming?.map(async (t) => {
                    await _tripModel.findByIdAndUpdate(t?._id, {
                        canceledByRenter: true,
                        tripStatus: 'CANCELLED',
                        cancelReason: "Trip Expired without Starting",
                        refundStatus: 'NoRefundRequired',
                        status: 'PAST'
                    });
                }));
            }

            const tripsToRenewSecurityDepositHold = await _tripModel.find({
                status: 'ONGOING',
                securityDepositExpiresOn: {$exists: true, $lt: new Date()}
            }).populate('renter');

            const _STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY as string;

            const stripe = new Stripe(
                _STRIPE_SECRET_KEY,
                {
                    apiVersion: "2020-08-27",
                    typescript: true
                });

            if (tripsToRenewSecurityDepositHold && tripsToRenewSecurityDepositHold?.length !== 0) {
                Promise.all(tripsToRenewSecurityDepositHold?.map(async (t) => {

                    if (t?.securityDepositPaymentIntent && t?.securityDepositPaymentIntent !== "") {
                        await stripe.paymentIntents.cancel(t?.securityDepositPaymentIntent);
                        const paymentMethod = t?.paymentMethod;
                        const customerToCharge = t?.renter?.stripeCustomerId;

                        if (paymentMethod && paymentMethod !== "" && customerToCharge !== "") {
                            const securityPaymentIntent = await stripe.paymentIntents.create({
                                amount: Math.round(t?.securityDeposit * 100),
                                currency: 'cad',
                                payment_method_types: ['card'],
                                payment_method: paymentMethod,
                                customer: customerToCharge,
                                confirm: true,
                                capture_method: 'manual',
                            });
                            // add 6 days to current date in milliseconds
                            const sixDaysFromNow = new Date(new Date().getTime() + 518400000);
                            await _tripModel.findByIdAndUpdate(t?._id, { securityDepositPaymentIntent: securityPaymentIntent?.id, securityDepositExpiresOn: sixDaysFromNow })
                        }
                    }
                }));
            }

            console.log("trips to delete", tripsToDelete);
            console.log("trips to stop upcoming", tripsToStopUpcoming);
            console.log("tripsToRenewSecurityDepositHold", tripsToRenewSecurityDepositHold);

            const usersToDelete = await _userModel.find({
                deleteBy: {$exists: true, $lt: new Date()}
            });

            if (usersToDelete && usersToDelete?.length !== 0) {
                Promise.all(usersToDelete?.map(async (u) => {
                    await _userModel.findByIdAndDelete(u?._id);
                }));
            }

            console.log("user to delete", usersToDelete);

            const _vesselModel = VesselModel.getInstance().getModel();
            const vessels = await _vesselModel.find().lean().populate('vesselFeatures').populate('vesselCategory').populate('vesselFuelType');
            // @ts-ignore
            const toUnpublish = [];
            if (vessels && vessels?.length !== 0) {
                vessels?.forEach(v => {
                    // @ts-ignore
                    if (v?.vesselCategory && v?.vesselCategory.length !== 0) {
                        // @ts-ignore
                        v?.vesselFeatures?.forEach(feature => {
                            if (feature.status === 'SOFT_DELETE') {
                                toUnpublish.push(v);
                            }
                        });
                    }

                    // @ts-ignore
                    if (v?.vesselCategory && v?.vesselCategory.length !== 0) {
                        // @ts-ignore
                        v?.vesselCategory?.forEach(cat => {
                            if (cat.status === 'SOFT_DELETE') {
                                // @ts-ignore
                                if (toUnpublish.findIndex(o => o._id !== v._id) < 0) {
                                    toUnpublish.push(v);
                                }
                            }
                        });
                    }

                    // @ts-ignore
                    if (v?.vesselFuelType) {
                        // @ts-ignore
                        if (v?.vesselFuelType?.status === 'SOFT_DELETE') {
                            // @ts-ignore
                            if (toUnpublish.findIndex(o => o._id !== v._id) < 0) {
                                toUnpublish.push(v);
                            }
                        }
                    }
                });
            }

            // @ts-ignore
            toUnpublish?.forEach(v => {
                v.vesselStatus = 'UNPUBLISHED';
            });
            const tripsToCancelSecurityDeposit = await _tripModel.find({status: 'PAST', tripStatus: 'COMPLETED',
                removeSecurityHoldAfter: {$exists: true, $lte: new Date()}});

            if (tripsToCancelSecurityDeposit && tripsToCancelSecurityDeposit?.length !== 0) {
                Promise.all(tripsToCancelSecurityDeposit?.map(async (tsc) => {
                    if (tsc?.securityDepositPaymentIntent && tsc?.securityDepositPaymentIntent !== "") {
                        setTimeout(async () => {
                            console.log("cancelling security deposit for", tsc?._id);
                            await stripe.paymentIntents.cancel(tsc?.securityDepositPaymentIntent);
                        }, 1000);
                    }
                }));
            }
        }, null, true, 'America/Toronto');

        // runs every month at 28thh of every month
        const monthlyJob = new CronJob('0 0 0 28 * *', async function () {
            // const _userModel = UserModel.getInstance().getModel();
            // const usersToDelete = await _userModel.find({ deleteBy: { $exists: true, $lte: new Date()}});
            // console.log(usersToDelete);

            const _tripModel = TripModel.getInstance().getModel();
            const _vesselModel = VesselModel.getInstance().getModel();
            const _vesselFuelModel = VesselFuelModel.getInstance().getModel();
            const vesselsFound = await _vesselModel.find({vesselStatus: "PUBLISHED"});
            const SOFT_DELETE_FUELS = await _vesselFuelModel.find({status: "SOFT_DELETE"});

            SOFT_DELETE_FUELS.forEach(fuel => {
                vesselsFound.forEach(async x => {
                    const tripsFound = await _tripModel.find({vessel: x._id});
                    if (tripsFound.length > 0) {
                        Promise.all(tripsFound?.map(async (y) => {
                            // @ts-ignored
                            if (y.status !== "UPCOMING" || y.status !== "ONGOING") {
                                // @ts-ignore
                                if (x.vesselStatus === "PUBLISHED" && x.vesselFuelType.toString() == fuel._id.toString()) {
                                    await _vesselModel.findByIdAndUpdate(x._id, {vesselStatus: "UNPUBLISHED"});
                                }
                            }
                        }));
                    }
                });
            });
        }, null, true, 'America/Toronto');

    }
}
