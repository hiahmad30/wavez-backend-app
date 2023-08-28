/* eslint-disable @typescript-eslint/no-empty-function */
import mongoose, {Document, Model, Schema} from 'mongoose';
import IModel from './Imodel.model';

export default class AdminAddListingModel implements IModel {
    private _model: Model<Document>;
    private static _instance: IModel;

    // singleton
    private constructor() {

    }

    public static getInstance(): IModel {
        if (!this._instance) this._instance = new AdminAddListingModel();
        return this._instance;
    }

    private _getSchema(): Schema {
        return new Schema({
            getStarted: {
                title: {
                    type: String,
                },
                description: {
                    type: String,
                },
                imageURL: {
                    type: String,
                }
            }
        });
    }

    public getModel(): Model<Document> {
        if (!this._model) {
            this._model = mongoose.model('AdminAddListing', this._getSchema(), 'adminAddListing');
        }
        return this._model;
    }
}
