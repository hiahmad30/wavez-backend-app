import mongoose, {Document, Model, Schema} from 'mongoose';
import IModel from './Imodel.model';

export default class DocumentsModel implements IModel {
    private _model: Model<Document>;
    private static _instance: IModel;

    // singleton
    private constructor() {

    }

    public static getInstance(): IModel {
        if (!this._instance) this._instance = new DocumentsModel();
        return this._instance;
    }

    private _getSchema(): Schema {
        return new Schema({
            fileType: {
                type: String
            },
            originalFileName: {
                type: String
            },
            fileURL: {
                type: String
            },
            isVerified: {
                type: Boolean,
                default: false
            },
            isRejected: {
                type: Boolean,
                default: false
            },
            rejectionReason: {
                type: String
            },
            status: {
                type: String,
                enum: Status,
                default: 'PENDING'
            }
        }, {timestamps: true});
    }

    public getModel(): Model<Document> {
        if (!this._model) {
            this._model = mongoose.model('Documents', this._getSchema(), 'documents');
        }
        return this._model;
    }
}

export enum Docs {
    BOATLICENSE = "BOATLICENSE",
    MARINESURVEY = "MARINESURVEY",
    VSS = "VSS",
    MOTORLICENCE = "MOTORLICENCE",
    PCOC = "PCOC",
    PCL = "PCL",
    PCCCP = "PCCCP",
    INSURANCE = "INSURANCE"
}

export enum Status {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTION = "REJECTION"
}
