import mongoose, {Schema, Model, Document} from 'mongoose';
import IModel from './Imodel.model';

export default class InvalidToken implements IModel {
    private _model: Model<Document>;
    private static _instance: IModel;

    // singleton
    private constructor() {

    }

    public static getInstance(): IModel {
        if (!this._instance) this._instance = new InvalidToken();
        return this._instance;
    }

    private _getSchema(): Schema {
        return new Schema({
            token: {
                type: String
            },
            invalidatedOn: {
                type: Date,
                default: new Date()
            }
        });
    }

    public getModel(): Model<Document> {
        if (!this._model) {
            this._model = mongoose.model('InvalidToken', this._getSchema(), 'InvalidTokens');
        }
        return this._model;
    }
}
