import mongoose, {Document, Model, Schema} from 'mongoose';
import IModel from './Imodel.model';

export default class AvailabilityModel implements IModel {
    private _model: Model<Document>;
    private static _instance: IModel;

    // singleton
    private constructor() {

    }

    public static getInstance(): IModel {
        if (!this._instance) this._instance = new AvailabilityModel();
        return this._instance;
    }

    private _getSchema(): Schema {
        return new Schema({
            availabilities: [{
                country: {
                    type: String,
                },
                provinces: [{
                    province: {
                        type: String,
                    },
                    months: [{
                        type: String,
                        enum: Months
                    }]
                }]
            }]
        }, {timestamps: true});
    }

    public getModel(): Model<Document> {
        if (!this._model) {
            this._model = mongoose.model('Availability', this._getSchema(), 'availability');
        }
        return this._model;
    }
}

export enum Months {
    JANUARY = "JANUARY",
    FEBRUARY = "FEBRUARY",
    MARCH = "MARCH",
    APRIL = "APRIL",
    MAY = "MAY",
    JUNE = "JUNE",
    JULY = "JULY",
    AUGUST = "AUGUST",
    SEPTEMBER = "SEPTEMBER",
    OCTOBER = "OCTOBER",
    NOVEMBER = "NOVEMBER",
    DECEMBER = "DECEMBER"
}
