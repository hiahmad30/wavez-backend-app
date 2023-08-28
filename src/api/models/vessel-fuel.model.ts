import mongoose, {Document, Model, Schema} from 'mongoose';
import IModel from './Imodel.model';

export default class VesselFuelModel implements IModel {
    private _model: Model<Document>;
    private static _instance: IModel;

    private constructor() {
    }

    public static getInstance(): IModel {
        if (!this._instance) this._instance = new VesselFuelModel();
        return this._instance;
    }

    private _getSchema(): Schema {
        return new Schema({
            fuel: {
                type: String,
                required: true
            },
            isVisible: {
                type: Boolean,
                required: true
            },
            status: {
                type: String
            }
        }, {timestamps: true});
    }

    public getModel(): Model<Document> {
        if (!this._model) {
            this._model = mongoose.model('VesselFuel', this._getSchema(), 'vesselFuel');
        }
        return this._model;
    }
}
