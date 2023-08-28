import mongoose, {Document, Model, Schema} from 'mongoose';
import IModel from './Imodel.model';

export default class NotificationsModel implements IModel {
    private _model: Model<Document>;
    private static _instance: IModel;

    // singleton
    private constructor() {

    }

    public static getInstance(): IModel {
        if (!this._instance) this._instance = new NotificationsModel();
        return this._instance;
    }

    private _getSchema(): Schema {
        return new Schema({
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            listings: {
                type: Number,
                default: 0
            },
            trips: {
                type: Number,
                default: 0
            },
            conversations: {
                type: Number,
                default: 0
            },
            reports: {
                type: Number,
                default: 0
            },
            verificationsVessel: {
                type: Number,
                default: 0
            },
            verificationsBoat: {
                type: Number,
                default: 0
            }
        }, {timestamps: true});
    }

    public getModel(): Model<Document> {
        if (!this._model) {
            this._model = mongoose.model('Notifications', this._getSchema(), 'notifications');
        }
        return this._model;
    }
}
