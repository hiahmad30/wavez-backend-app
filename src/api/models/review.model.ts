import mongoose, {Document, Model, Schema} from 'mongoose';
import IModel from './Imodel.model';

export default class ReviewModel implements IModel {
    private _model: Model<Document>;
    private static _instance: IModel;

    // singleton
    private constructor() {
        //
    }

    public static getInstance(): IModel {
        if (!this._instance) this._instance = new ReviewModel();
        return this._instance;
    }

    private _getSchema(): Schema {
        return new Schema({
            vessel: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Vessel'
            },
            reviewer: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            description: {
                type: String
            },
            rating: {
                type: Number,
                min: [1, 'Review rating cannot be less than 1'],
                max: [5, 'Review rating cannot be more than 5'],
                required: true
            },
            sequence: {
                type: Number
            }
        }, {timestamps: true});
    }

    public getModel(): Model<Document> {
        if (!this._model) {
            this._model = mongoose.model('Review', this._getSchema(), 'reviews');
        }
        return this._model;
    }
}
