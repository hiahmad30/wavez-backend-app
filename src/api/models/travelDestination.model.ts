import mongoose, {Document, Model, Schema} from 'mongoose';
import IModel from './Imodel.model';

export default class TravelDestinationModel implements IModel {
    private _model: Model<Document>;
    private static _instance: IModel;

    // singleton
    private constructor() {

    }

    public static getInstance(): IModel {
        if (!this._instance) this._instance = new TravelDestinationModel();
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
            }
        });
    }

    public getModel(): Model<Document> {
        if (!this._model) {
            this._model = mongoose.model('TravelDestination', this._getSchema(), 'travelDestinations');
        }
        return this._model;
    }
}
