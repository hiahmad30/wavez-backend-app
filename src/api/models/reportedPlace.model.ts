import mongoose, {Document, Model, Schema} from 'mongoose';
import IModel from './Imodel.model';

export default class ReportedPlaceModel implements IModel {
    private _model: Model<Document>;
    private static _instance: IModel;

    // singleton
    private constructor() {

    }

    public static getInstance(): IModel {
        if (!this._instance) this._instance = new ReportedPlaceModel();
        return this._instance;
    }

    private _getSchema(): Schema {
        return new Schema({
            title: {
                type: String
            },
            description: {
                type: String
            },
            location: {
                type: {
                    type: String,
                    enum: ['Point'],
                    required: true
                },
                coordinates: {
                    type: [Number],
                    required: true
                }
            },
            addedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        });
    }

    public getModel(): Model<Document> {
        if (!this._model) {
            this._model = mongoose.model('ReportedPlaces', this._getSchema(), 'reportedPlaces');
        }
        return this._model;
    }
}
