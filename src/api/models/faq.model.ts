import mongoose, {Document, Model, Schema} from 'mongoose';
import IModel from './Imodel.model';

export default class FaqModel implements IModel {
    private _model: Model<Document>;
    private static _instance: IModel;

    // singleton
    private constructor() {

    }

    public static getInstance(): IModel {
        if (!this._instance) this._instance = new FaqModel();
        return this._instance;
    }

    private _getSchema(): Schema {
        return new Schema({
            question: {
                type: String,
                required: true
            },
            answer: {
                type: String,
                required: true
            },
            visible: {
                type: Boolean,
                default: true
            }
        });
    }

    public getModel(): Model<Document> {
        if (!this._model) {
            this._model = mongoose.model('Faq', this._getSchema(), 'faqs');
        }
        return this._model;
    }
}

