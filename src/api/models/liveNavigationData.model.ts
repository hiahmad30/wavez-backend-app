import mongoose, {Document, Model, Schema} from 'mongoose';
import IModel from './Imodel.model';

export default class LiveNavigationDataModel implements IModel {
    private _model: Model<Document>;
    private static _instance: IModel;

    // singleton
    private constructor() {

    }

    public static getInstance(): IModel {
        if (!this._instance) this._instance = new LiveNavigationDataModel();
        return this._instance;
    }

    private _getSchema(): Schema {
        return new Schema({
            tripId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Trip'
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
            }
        }, {timestamps: true});
    }

    public getModel(): Model<Document> {
        if (!this._model) {
            this._model = mongoose.model('LiveNavigationData', this._getSchema(), 'liveNavigationData');
        }
        return this._model;
    }
}
