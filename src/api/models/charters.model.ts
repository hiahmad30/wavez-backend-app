import mongoose, {Document, Model, Schema} from 'mongoose';
import IModel from './Imodel.model';
import {VesselStatus} from './shared-enums/vessel-status';

export default class ChartersModel implements IModel {
    private _model: Model<Document>;
    private static _instance: IModel;

    private constructor() {
    }

    public static getInstance(): IModel {
        if (!this._instance) this._instance = new ChartersModel();
        return this._instance;
    }

    // Images, Number of passengers, Rental title, Rental description, Cost of the Rental and the Location that the Rental is available.
    private _getSchema(): Schema {
        return new Schema({
            images: [{
                caption: {
                    type: String,
                },
                imageURL: {
                    type: String,
                },
                sequence: {
                    type: Number
                }
            }],
            numberOfPassengers: {
                type: Number,

            },
            vesselLocation: {
                longitude: {
                    type: String,

                },
                latitude: {
                    type: String,
                }
            },
            destinationLocation: [{
                longitude: {
                    type: String,

                },
                latitude: {
                    type: String,
                }
            }],
            vesselAddress: {
                street: {
                    type: String,
                },
                postalCode: {
                    type: String,
                },
                city: {
                    type: String,
                },
                countryCode: {
                    type: String,

                },
                country: {
                    type: String,
                },
                province: {
                    type: String,
                }
            },
            rawAddress: {
                type: String
            },
            destinationAddress: [{
                street: {
                    type: String,
                },
                postalCode: {
                    type: String,
                },
                city: {
                    type: String,
                },
                countryCode: {
                    type: String,
                },
                country: {
                    type: String,
                },
                province: {
                    type: String
                },
                rawAddress: {
                    type: String
                }
            }],
            title: {
                type: String,

            },
            description: {
                type: String,
                default: ''
            },
            vesselYear: {
                type: Number,

            },
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            vesselType: {
                type: String,
                enum: ['CHARTER'],
                required: true
            },
            vesselCategory: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'VesselCategory',
            }],
            vesselStatus: {
                type: String,
                enum: VesselStatus,
                default: 'UNPUBLISHED',

            },
            vesselPlacement: {
                type: String
            },
            vesselBrand: {
                type: String
            },
            vesselModelInfo: {
                type: String
            },
            vesselLength: {
                type: Number
            },
            vesselWeight: {
                unit: {
                    type: String
                },
                weight: {
                    type: Number
                },
            },
            vesselMaxSpeed: {
                type: Number
            },
            vesselHorsePower: {
                type: Number
            },
            vesselFuelType: {
                type: String
            },
            vesselFeatures: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'VesselFeature'
            }],
            vesselPricing: {
                currency: {
                    type: String
                },
                minimumDeposit: {
                    type: Number
                },
                perHour:{
                    checked:{
                        type: Boolean
                    },
                    amount: {
                        type: Number
                    },
                    minimumTime: {
                        type: Number
                    }
                },
                perDay:{
                    checked:{
                        type: Boolean
                    },
                    amount: {
                        type: Number
                    },
                    minimumTime: {
                        type: Number
                    }
                },
                perWeek:{
                    checked:{
                        type: Boolean
                    },
                    amount: {
                        type: Number
                    },
                    minimumTime: {
                        type: Number
                    }
                }
            },
            documentsIds: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Documents'
            }],
            trailerPlateNumber: {
                type: String
            },
            sequence: {
                type: Number
            },
            events: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Event'
            }]
        }, {timestamps: true});
    }

    public getModel(): Model<Document> {
        if (!this._model) {
            this._model = mongoose.model('Charters', this._getSchema(), 'charters');
        }
        return this._model;
    }
}
