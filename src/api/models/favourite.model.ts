import mongoose, {Document, Model, Schema} from 'mongoose';
import IModel from './Imodel.model';

export default class FavouriteModel implements IModel {
    private _model: Model<Document>;
    private static _instance: IModel;

    // singleton
    private constructor() {

    }

    public static getInstance(): IModel {
        if (!this._instance) this._instance = new FavouriteModel();
        return this._instance;
    }

    private _getSchema(): Schema {
        return new Schema({
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                    required: true
                },
                favoriteRentals: [{
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Vessel'
                }],
                favoriteCharters: [{
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Vessel'
                }],
                favoriteStays: [{
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Vessel'
                }],
                shortListRentals: [{
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Vessel'
                }],
                shortListCharters: [{
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Vessel'
                }],
                shortListStays: [{
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Vessel'
                }]
            }, {timestamps: true}
        );
    }

    public getModel(): Model<Document> {
        if (!this._model) {
            this._model = mongoose.model('Favorite', this._getSchema(), 'favorite');
        }
        return this._model;
    }
}
