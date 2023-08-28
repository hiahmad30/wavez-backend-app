import mongoose, {Document, Model, Schema} from 'mongoose';
import IModel from './Imodel.model';

export default class ReportModel implements IModel {
    private _model: Model<Document>;
    private static _instance: IModel;

    // singleton
    private constructor() {

    }

    public static getInstance(): IModel {
        if (!this._instance) this._instance = new ReportModel();
        return this._instance;
    }

    private _getSchema(): Schema {
        return new Schema({
            transactionId: {
                type: String
            },
            reportedDate: {
                type: Date,
                default: new Date()
            },
            trip: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Trip'
            },
            description: {
                type: String,
                required: true
            },
            photos: [{
                type: String
            }],
            reportedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            userType: {
                type: String,
                enum: ['VESSEL_OWNER', 'GUEST'],
                default: 'VESSEL_OWNER',
                required: true
            },
            stripeTransactionId: {
                type: String
            },
            reportType: {
                type: String,
                enum: ['PRE_DEPARTURE',
                    'POST_TRIP',
                    'WEATHER',
                    'EQUIPMENT',
                    'GENERAL_PREPARATIONS',
                    'CHECK_DOCUMENTATION',
                    'WATERCRAFT_CONDITIONS',
                    'POST_DOCUMENTATION']
            }
        });
    }

    public getModel(): Model<Document> {
        if (!this._model) {
            this._model = mongoose.model('Report', this._getSchema(), 'reports');
        }
        return this._model;
    }
}

