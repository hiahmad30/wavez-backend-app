import mongoose, {Document, Model, Schema} from 'mongoose';
import IModel from './Imodel.model';

export default class EventModel implements IModel {
    private _model: Model<Document>;
    private static _instance: IModel;

    // singleton
    private constructor() {

    }

    public static getInstance(): IModel {
        if (!this._instance) this._instance = new EventModel();
        return this._instance;
    }

    private _getSchema(): Schema {
        return new Schema({
            eventType: {
                type: String,
                enum: EventType,
                default: EventType.BOOKED
            },
            start: {
                type: Date,
                default: new Date()
            },
            end: {
                type: Date,
                default: new Date()
            },
            userDetails: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            bookingDetails: {
                numberOfPassengers: {
                    type: Number
                },
                notes: {
                    type: String
                }
            },
            createdBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            modifiedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            vessel: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Vessel'
            },
            trip: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Trip'
            }
        }, {timestamps: true});
    }

    public getModel(): Model<Document> {
        if (!this._model) {
            this._model = mongoose.model('Event', this._getSchema(), 'events');
        }
        return this._model;
    }
}

export enum EventType {
    BLOCKED = 'BLOCKED',
    BOOKED = 'BOOKED',
    PENDING = 'PENDING'
}
