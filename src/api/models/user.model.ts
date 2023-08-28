import mongoose, {Document, Model, Schema} from 'mongoose';
import IModel from './Imodel.model';

export default class UserModel implements IUserModel {
    private _model: Model<IUser>;
    private static _instance: IUserModel;

    // singleton
    private constructor() {

    }

    public static getInstance(): IUserModel {
        if (!this._instance) this._instance = new UserModel();
        return this._instance;
    }

    private _getSchema(): Schema {
        return new Schema({
            firstName: {
                type: String,
                required: true,
            },
            lastName: {
                type: String,
                required: true,
            },
            strikeCount: {
                type: Number,
                required: true,
            },
            paymentDue: {
                type: Number,
                required: true,
                default: 0
            },
            email: {
                type: String,
                required: true,
            },
            password: {
                type: String,
            },
            playerIds: [{type: String}],
            phoneNumber: {
                type: Number,
                required: true,
            },
            userType: {
                type: String,
                enum: Role,
                default: Role.USER
            },
            agreementAccepted: {
                type: Boolean,
                default: false
            },
            agreementAcceptedDate: {
                type: Date,
                default: new Date()
            },
            stripeCustomerId: {
                type: String,
                // required: true
            },
            biometricPublicKey: {
                type: String
            },
            documents: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Documents'
            }],
            gender: {
                type: String
            },
            profileImageUrl: {
                type: String
            },
            dateOfBirth: {
                type: Date
            },
            primaryLanguage: {
                type: String
            },
            userAddress: {
                street: {
                    type: String,
                },
                postalCode: {
                    type: String,
                },
                city: {
                    type: String,
                },
                countryCode: {
                    type: String,
                },
                country: {
                    type: String,
                },
                province: {
                    type: String,
                }
            },
            rawAddress: {
                type: String
            },
            disabled: {
                type: Boolean,
                default: false
            },
            isVesselOwner: {
                type: Boolean,
                default: false
            },
            theme: {
                type: String,
                enum: Theme,
                default: Theme.LIGHT
            },
            stripeAccountId: {
                type: String
            },
            deleteBy: {
                type: Date
            }
        }, {timestamps: true});
    }

    public getModel(): Model<IUser> {
        if (!this._model) {
            this._model = mongoose.model<IUser>('User', this._getSchema(), 'user');
        }
        return this._model;
    }
}

export enum Role {
    PSEUDO_ADMIN = 'PSEUDO_ADMIN',
    USER = 'USER'
}

export enum Theme {
    LIGHT = 'LIGHT',
    DARK = 'DARK'
}

interface IUser extends Document {
    firstName: string;
    lastName: string;
    strikeCount: number;
    paymentDue: number;
    email: string;
    password: string;
    playerIds: string[];
    phoneNumber: number;
    userType: string;
    agreementAccepted: boolean;
    agreementAcceptedDate: Date;
    stripeCustomerId: string;
    biometricPublicKey: string;
    documents: any[];
    gender: string;
    profileImageUrl: string;
    dateOfBirth: Date;
    primaryLanguage: string;
    userAddress: {
        street: string;
        postalCode: string;
        city: string;
        countryCode: string;
        country: string;
        province: string;
    };
    rawAddress: string;
    disabled: boolean;
    isVesselOwner: boolean;
    theme: string;
    stripeAccountId: string;
    deleteBy: Date;
}

export interface IUserModel {
    getModel(): Model<IUser>;
}
