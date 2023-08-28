import mongoose, {Document, Model, Schema} from 'mongoose';
import IModel from './Imodel.model';

export default class ConfigurationModel implements IModel {
    private _model: Model<Document>;
    private static _instance: IModel;

    // singleton
    private constructor() {

    }

    public static getInstance(): IModel {
        if (!this._instance) this._instance = new ConfigurationModel();
        return this._instance;
    }

    private _getSchema(): Schema {
        return new Schema({
            key: {
                type: String,
                unique: true,
                enum: Keys
            },
            stringValue: {
                type: String
            },
            booleanValue: {
                type: Boolean
            },
            numberValue: {
                type: Number
            },
            arrayValue: [{
                type: String,
            }]
        });
    }

    public getModel(): Model<Document> {
        if (!this._model) {
            this._model = mongoose.model('Configuration', this._getSchema(), 'configurations');
        }
        return this._model;
    }
}

export enum Keys {
    HOME_HERO_IMAGE = "HOME_HERO_IMAGE",
    HOME_HERO_TEXT = "HOME_HERO_TEXT",
    HOME_INFORMATION_BANNER_TITLE = "HOME_INFORMATION_BANNER_TITLE",
    HOME_INFORMATION_BANNER_PAGE_CONTENT = "HOME_INFORMATION_BANNER_PAGE_CONTENT",
    GET_STARTED_TITLE = "GET_STARTED_TITLE",
    GET_STARTED_DESCRIPTION = "GET_STARTED_DESCRIPTION",
    GET_STARTED_IMAGE = "GET_STARTED_IMAGE",
    PHOTO_MINIMUM_NUMBER = "PHOTO_MINIMUM_NUMBER",
    PHOTO_MAXIMUM_NUMBER = "PHOTO_MAXIMUM_NUMBER",
    MAXIMUM_VESSEL_AGE = "MAXIMUM_VESSEL_AGE",
    CRV_GREATER = "CRV_GREATER",
    CRV_GREATER_PASSENGER = "CRV_GREATER_PASSENGER",
    SVOP_MED_SDV_BS_LESS_EQUAL = "SVOP_MED_SDV_BS_LESS_EQUAL",
    Limited_MASTER_60_MED_SDV_BS_LESS = "Limited_MASTER_60_MED_SDV_BS_LESS",
    MASTER_150_MED_BST_LESS_EQUAL = "MASTER_150_MED_BST_LESS_EQUAL",
    ABOUT_WAVEZ_TITLE = "ABOUT_WAVEZ_TITLE",
    ABOUT_WAVEZ_PAGE_CONTENT = "ABOUT_WAVEZ_PAGE_CONTENT",
    HOW_IT_WORKS_TITLE = "HOW_IT_WORKS_TITLE",
    HOW_IT_WORKS_PAGE_CONTENT = "HOW_IT_WORKS_PAGE_CONTENT",
    PARTNERS_TITLE = "PARTNERS_TITLE",
    PARTNERS_PAGE_CONTENT = "PARTNERS_PAGE_CONTENT",
    CONTACT_US_TITLE = "CONTACT_US_TITLE",
    CONTACT_US_PAGE_CONTENT = "CONTACT_US_PAGE_CONTENT",
    PRIVACY_POLICY_TITLE = "PRIVACY_POLICY_TITLE",
    PRIVACY_POLICY_PAGE_CONTENT = "PRIVACY_POLICY_PAGE_CONTENT",
    TERMS_OF_SERVICE_TITLE = "TERMS_OF_SERVICE_TITLE",
    TERMS_OF_SERVICE_PAGE_CONTENT = "TERMS_OF_SERVICE_PAGE_CONTENT",
    HOW_IT_WORKS_ADMIN_PANEL = "HOW_IT_WORKS_ADMIN_PANEL",
    COMMUNITY_GUIDELINES_PAGE_CONTENT = "COMMUNITY_GUIDELINES_PAGE_CONTENT"
}
