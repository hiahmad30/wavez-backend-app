import mongoose, {Document, Model, Schema} from 'mongoose';
import IModel from './Imodel.model';

export default class TripModel implements ITripModel {
    private _model: Model<ITrip>;
    private static _instance: ITripModel;

    // singleton
    private constructor() {

    }

    public static getInstance(): ITripModel {
        if (!this._instance) this._instance = new TripModel();
        return this._instance;
    }

    private _getSchema(): Schema {
        return new Schema({
            vessel: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Vessel'
            },
            renter: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            vesselOwner: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            totalPrice: {
                type: Number
            },
            serviceFees: {
              type: Number
            },
            securityDeposit: {
                type: Number
            },
            numberOfGuests: {
                type: Number
            },
            startVerificationCode: {
                type: String
            },
            endVerificationCode: {
                type: String
            },
            bookingDate: {
                type: Date
            },
            bookingStartDate: {
                type: Date
            },
            bookingEndDate: {
                type: Date
            },
            canceledByRenter: {
                type: Boolean
            },
            canceledByVesselOwner: {
                type: Boolean
            },
            rejectedByVesselOwner: {
                type: Boolean
            },
            cancelReason: {
                type: String
            },
            rejectReason: {
                type: String
            },
            offerAccepted: {
                type: Boolean
            },
            resolved: {
                type: Boolean
            },
            status: {
                type: String,
                enum: Status,
                default: 'OFFER'
            },
            tripStatus: {
                type: String,
                enum: TripStatus,
                default: 'NOT_STARTED'
            },
            refundStatus: {
                type: String,
                enum: RefundStatus
            },
            taxAmount: {
                type: Number
            },
            taxPercentage: {
                type: Number
            },
            paymentIntent: {
                type: String
            },
            securityDepositPaymentIntent: {
                type: String
            },
            secondHalfPaymentIntent: {
                type: String
            },
            paymentMethod: {
                type: String
            },
            transferGroup: {
                type: String
            },
            bookingNotes: {
                type: String
            },
            paymentToken: {
                type: String
            },
            reviewed: {
                type: Boolean,
                default: false
            },
            displayAmount: {
                type: Number,
                default: 0
            },
            applicationFees: {
                type: String
            },
            secondHalfApplicationFees: {
                type: String
            },
            refundId: {
              type: String
            },
            secondHalfRefundId: {
                type: String
            },
            applicationFeesRefundId: {
                type: String
            },
            secondHalfApplicationFeesRefundId: {
                type: String
            },
            taxRates: [{
                id: String,
                state: String,
                percentage: Number,
                amount: Number,
                taxType: String
            }],
            securityDepositExpiresOn: {
                type: Date
            },
            removeSecurityHoldAfter: {
                type: Date
            }
        }, {timestamps: true});
    }

    public getModel(): Model<ITrip> {
        if (!this._model) {
            this._model = mongoose.model<ITrip>('Trip', this._getSchema(), 'trip');
        }
        return this._model;
    }
}

export enum TripStatus {
    NOT_STARTED='NOT_STARTED',
    STARTED='STARTED',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
}

export enum Status {
    PAST = 'PAST',
    ONGOING = 'ONGOING',
    UPCOMING = 'UPCOMING',
    OFFER = 'OFFER',
}

export enum RefundStatus {
    RefundInitiated = 'RefundInitiated',
    RefundInProcess = 'RefundInProcess',
    RefundProcessed = 'RefundProcessed',
    RefundFailed = 'RefundFailed',
    NoRefundRequired = 'NoRefundRequired',
    NoRefundIssued = 'NoRefundIssued'
}

interface ITrip extends Document {
    vessel: string | any;
    renter: string | any;
    vesselOwner: string |any;
    totalPrice: number;
    serviceFees: number;
    securityDeposit: number;
    numberOfGuests: number;
    startVerificationCode: string;
    endVerificationCode: string;
    bookingDate: Date;
    bookingStartDate: Date;
    bookingEndDate: Date;
    canceledByRenter: boolean;
    canceledByVesselOwner: boolean;
    rejectedByVesselOwner: boolean;
    cancelReason: string;
    rejectReason: string;
    offerAccepted: boolean;
    resolved: boolean;
    status: string;
    tripStatus: string;
    refundStatus: string;
    taxAmount: number;
    taxPercentage: number;
    paymentIntent: string;
    securityDepositPaymentIntent: string;
    secondHalfPaymentIntent: string;
    paymentMethod: string;
    transferGroup: string;
    bookingNotes: string;
    paymentToken: string;
    reviewed: boolean;
    displayAmount: number;
    taxRates: taxAmount[];
    applicationFees: string;
    secondHalfApplicationFees: string;
    refundId: string,
    secondHalfRefundId: string,
    applicationFeesRefundId: string,
    secondHalfApplicationFeesRefundId: string,
    securityDepositExpiresOn: Date;
    updatedAt: Date;
    createdAt: Date;
    removeSecurityHoldAfter: Date;
}

class taxAmount {
    id: string;
    state: string;
    percentage: number;
    amount: number;
    taxType: string;
}

export interface ITripModel {
    getModel(): Model<ITrip>;
}
