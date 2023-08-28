import mongoose, {Document, Model, Schema} from 'mongoose';
import IModel from './Imodel.model';

export default class ImagesIdentityVerificationRecordModel implements IModel {
    private _model: Model<Document>;
    private static _instance: IModel;

    // singleton
    private constructor() {

    }

    public static getInstance(): IModel {
        if (!this._instance) this._instance = new ImagesIdentityVerificationRecordModel();
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
            this._model = mongoose.model('ImagesIdentityVerificationRecordModel', this._getSchema(), 'imagesIdentityVerificationRecordModel');
        }
        return this._model;
    }
}
