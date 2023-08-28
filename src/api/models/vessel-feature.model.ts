import mongoose, {Document, Model, Schema} from 'mongoose';
import IModel from './Imodel.model';

export default class VesselFeatureModel implements IModel {
    private _model: Model<Document>;
    private static _instance: IModel;

    private constructor() {
    }

    public static getInstance(): IModel {
        if (!this._instance) this._instance = new VesselFeatureModel();
        return this._instance;
    }

    private _getSchema(): Schema {
        return new Schema({
            feature: {
                type: String,
                required: true
            },
            iconURL: {
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
            this._model = mongoose.model('VesselFeature', this._getSchema(), 'vesselFeatures');
        }
        return this._model;
    }
}
