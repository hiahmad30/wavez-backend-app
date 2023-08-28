import mongoose, {Document, Model, Schema} from 'mongoose';
import IModel from './Imodel.model';

export default class IdentityVerificationRecordModel implements IModel {
    private _model: Model<Document>;
    private static _instance: IModel;

    // singleton
    private constructor() {

    }

    public static getInstance(): IModel {
        if (!this._instance) this._instance = new IdentityVerificationRecordModel();
        return this._instance;
    }

    private _getSchema(): Schema {
        return new Schema({
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        }, {strict: false, timestamps: true});
    }

    public getModel(): Model<Document> {
        if (!this._model) {
            this._model = mongoose.model('IdentityVerificationRecord', this._getSchema(), 'identityVerificationRecord');
        }
        return this._model;
    }
}
