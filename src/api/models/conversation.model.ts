import mongoose, {Document, Model, Schema} from 'mongoose';
import IModel from './Imodel.model';

export default class ConversationModel implements IModel {
    private _model: Model<Document>;
    private static _instance: IModel;

    // singleton
    private constructor() {

    }

    public static getInstance(): IModel {
        if (!this._instance) this._instance = new ConversationModel();
        return this._instance;
    }

    private _getSchema(): Schema {
        return new Schema({
            members: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }],
            hasMessages: [{
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                },
                seen: {
                    type: Boolean
                }
            }],
            hidden: {
                type: Boolean
            },
            isDisabled:{
                type: Boolean
            }
        }, {timestamps: true});
    }

    public getModel(): Model<Document> {
        if (!this._model) {
            this._model = mongoose.model('Conversation', this._getSchema(), 'conversation');
        }
        return this._model;
    }
}
