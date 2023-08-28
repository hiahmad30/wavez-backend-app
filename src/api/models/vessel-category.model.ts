import mongoose, {Document, Model, Schema} from 'mongoose';
import IModel from './Imodel.model';

export default class VesselCategoryModel implements IModel {
    private _model: Model<Document>;
    private static _instance: IModel;

    private constructor() {
    }

    public static getInstance(): IModel {
        if (!this._instance) this._instance = new VesselCategoryModel();
        return this._instance;
    }

    private _getSchema(): Schema {
        return new Schema({
            name: {
                type: String,
                required: true
            },
            isRental: {
                type: Boolean
            },
            isCharter: {
                type: Boolean
            },
            isStay: {
                type: Boolean
            },
            stay: {
                proofOfId: {
                    optional: {
                        type: Boolean,
                        default: false
                    },
                    required: {
                        type: Boolean,
                        default: false
                    }
                },
                vesselDriversLicense: {
                    optional: {
                        type: Boolean,
                        default: false
                    },
                    required: {
                        type: Boolean,
                        default: false
                    }
                },
                vesselLicense: {
                    optional: {
                        type: Boolean,
                        default: false
                    },
                    required: {
                        type: Boolean,
                        default: false
                    }
                },
                vesselSafety: {
                    optional: {
                        type: Boolean,
                        default: false
                    },
                    required: {
                        type: Boolean,
                        default: false
                    }
                },
                insurance: {
                    optional: {
                        type: Boolean,
                        default: false
                    },
                    required: {
                        type: Boolean,
                        default: false
                    }
                },
                serialNumber: {
                    optional: {
                        type: Boolean,
                        default: false
                    },
                    required: {
                        type: Boolean,
                        default: false
                    }
                }
            },
            charter: {
                proofOfId: {
                    optional: {
                        type: Boolean,
                        default: false
                    },
                    required: {
                        type: Boolean,
                        default: false
                    }
                },
                vesselDriversLicense: {
                    optional: {
                        type: Boolean,
                        default: false
                    },
                    required: {
                        type: Boolean,
                        default: false
                    }
                },
                vesselLicense: {
                    optional: {
                        type: Boolean,
                        default: false
                    },
                    required: {
                        type: Boolean,
                        default: false
                    }
                },
                vesselSafety: {
                    optional: {
                        type: Boolean,
                        default: false
                    },
                    required: {
                        type: Boolean,
                        default: false
                    }
                },
                insurance: {
                    optional: {
                        type: Boolean,
                        default: false
                    },
                    required: {
                        type: Boolean,
                        default: false
                    }
                },
                serialNumber: {
                    optional: {
                        type: Boolean,
                        default: false
                    },
                    required: {
                        type: Boolean,
                        default: false
                    }
                }
            },
            rental: {
                proofOfId: {
                    optional: {
                        type: Boolean,
                        default: false
                    },
                    required: {
                        type: Boolean,
                        default: false
                    }
                },
                vesselDriversLicense: {
                    optional: {
                        type: Boolean,
                        default: false
                    },
                    required: {
                        type: Boolean,
                        default: false
                    }
                },
                vesselLicense: {
                    optional: {
                        type: Boolean,
                        default: false
                    },
                    required: {
                        type: Boolean,
                        default: false
                    }
                },
                vesselSafety: {
                    optional: {
                        type: Boolean,
                        default: false
                    },
                    required: {
                        type: Boolean,
                        default: false
                    }
                },
                insurance: {
                    optional: {
                        type: Boolean,
                        default: false
                    },
                    required: {
                        type: Boolean,
                        default: false
                    }
                },
                serialNumber: {
                    optional: {
                        type: Boolean,
                        default: false
                    },
                    required: {
                        type: Boolean,
                        default: false
                    }
                }
            },
            isProofOfId: {
                type: Boolean
            },
            isVesselDriversLicense: {
                type: Boolean
            },
            isVesselLicense: {
                type: Boolean
            },
            isVesselSafety: {
                type: Boolean
            },
            isInsurance: {
                type: Boolean
            },
            isVisible: {
                type: Boolean,
                required: true
            },
            isSerialNumber: {
                type: Boolean
            },
            status: {
                type: String
            }
        }, {timestamps: true});
    }

    public getModel(): Model<Document> {
        if (!this._model) {
            this._model = mongoose.model('VesselCategory', this._getSchema(), 'vesselCategories');
        }
        return this._model;
    }
}
