import mongoose, {Document, Model, Schema} from 'mongoose';
import IModel from './Imodel.model';

export default class MessageModel implements IModel {
    private _model: Model<Document>;
    private static _instance: IModel;

    // singleton
    private constructor() {

    }

    public static getInstance(): IModel {
        if (!this._instance) this._instance = new MessageModel();
        return this._instance;
    }

    private _getSchema(): Schema {
        return new Schema({
            conversationId: {
                type: String
            },
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
            text: {
                type: String
            },
            imageUrl: {
                type: String
            },
        }, {timestamps: true});
    }

    public getModel(): Model<Document> {
        if (!this._model) {
            this._model = mongoose.model('Message', this._getSchema(), 'message');
        }
        return this._model;
    }
}
