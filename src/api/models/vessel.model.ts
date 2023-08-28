/* eslint-disable @typescript-eslint/no-empty-function */
import mongoose, {Document, Model, Schema} from 'mongoose';
import IModel from './Imodel.model';
import {VesselStatus} from './shared-enums/vessel-status';
import {VesselType} from "./shared-enums/vessel-type";

export default class VesselModel implements IModel {
    private _model: Model<Document>;
    private static _instance: IModel;

    private constructor() {
    }

    public static getInstance(): IModel {
        if (!this._instance) this._instance = new VesselModel();
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
                type: Number
            },
            vesselLocation: {
                longitude: {
                    type: String
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
            vesselAddress: {
                street: {
                    type: String
                },
                postalCode: {
                    type: String
                },
                city: {
                    type: String
                },
                countryCode: {
                    type: String,

                },
                country: {
                    type: String,
                },
                province: {
                    type: String
                }
            },
            rawAddress: {
                type: String
            },
            title: {
                type: String,
            },
            description: {
                type: String,
                default: ''
            },
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            vesselType: {
                type: String,
                enum: VesselType,
                required: true
            },
            vesselCategory: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'VesselCategory',
            }],
            vesselStatus: {
                type: String,
                enum: VesselStatus,
                default: 'UNPUBLISHED'
            },
            numberOfBathrooms: {
                type: Number,
            },
            numberOfKitchens: {
                type: Number,
            },
            numberOfBeds: {
                type: Number,
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
            vesselYear: {
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
                type: mongoose.Schema.Types.ObjectId,
                ref: 'VesselFuel'
            },
            vesselPricing: {
                currency: {
                    type: String
                },
                minimumDeposit: {
                    type: Number
                },
                minimumHours: {
                    type: Number
                },
                perHour: {
                    amount: {
                        type: Number
                    }
                },
                perDay: {
                    amount: {
                        type: Number
                    }
                },
                perWeek: {
                    amount: {
                        type: Number
                    }
                }
            },
            vesselFeatures: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'VesselFeature'
            }],
            documentsIds: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Documents'
            }],
            serialNumber: {
                type: String
            },
            hasLifeJackets: {
                type: Boolean
            },
            hasFirstAidKit: {
                type: Boolean
            },
            allDocumentsCat: [{type: Object}],
            hasFlashlight: {
                type: Boolean
            },
            hasRope: {
                type: Boolean
            },
            trailerPlateNumber: {
                type: String
            },
            sequence: {
                type: Number
            },
            blockedEvents: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Event'
            }],
            bookedEvents: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Event'
            }],
            averageRating: {
                type: Number
            },
            noOfBookings: {
                type: Number,
                default: 0
            }
        }, {timestamps: true});
    }

    public getModel(): Model<Document> {
        if (!this._model) {
            this._model = mongoose.model('Vessel', this._getSchema(), 'vessels');
        }
        return this._model;
    }
}
